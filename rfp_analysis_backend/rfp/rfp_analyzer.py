from typing import Dict, Any
import os
import json
from dotenv import load_dotenv
from asgiref.sync import async_to_sync
from haystack import Pipeline
from haystack.components.builders import PromptBuilder
from haystack.components.embedders import OpenAITextEmbedder
from haystack.components.generators import OpenAIGenerator
from haystack_integrations.components.retrievers.pinecone import PineconeEmbeddingRetriever
from haystack.utils import Secret
from pinecone_store import document_store
import logging
import re

# Simple in-memory cache
analysis_cache = {}

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def sanitize_json_response(response_text):
    """
    Attempt to fix common JSON formatting issues in LLM responses
    """
    # Try to extract just the JSON part if there's text before or after
    json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
    if json_match:
        response_text = json_match.group(1)
    
    # Remove any markdown code block markers that might remain
    response_text = re.sub(r'```.*\n|```', '', response_text)
    
    # Try to fix common JSON formatting errors
    response_text = response_text.replace("'", '"')  # Replace single quotes with double quotes
    response_text = re.sub(r',\s*}', '}', response_text)  # Remove trailing commas in objects
    response_text = re.sub(r',\s*]', ']', response_text)  # Remove trailing commas in arrays
    
    return response_text.strip()

class RFPAnalyzer:
    def __init__(self, vector_store):
        self.vector_store = vector_store
        # Use only the dedicated API key without fallback
        self.api_key = os.getenv("BID_QUALIFIER_OPENAI_API_KEY")
        
        # Log API key information (safely)
        if self.api_key:
            # Only log the first 5 and last 4 characters for security
            masked_key = self.api_key[:5] + "..." + self.api_key[-4:]
            logger.info(f"Using BID_QUALIFIER_OPENAI_API_KEY: {masked_key}")
        else:
            logger.error("BID_QUALIFIER_OPENAI_API_KEY not found!")
            raise ValueError("No OpenAI API key found. Please set BID_QUALIFIER_OPENAI_API_KEY.")

    def _load_template(self, template_type):
        """
        Load a template from file or return a default template if not found.
        
        Args:
            template_type: The type of template to load
            
        Returns:
            The template string
        """
        # Define the base directory for templates
        template_dir = os.path.join(os.path.dirname(__file__), "templates")
        
        # Ensure the template directory exists
        if not os.path.exists(template_dir):
            os.makedirs(template_dir)
            
        # Define the path to the template file
        template_path = os.path.join(template_dir, f"{template_type}.txt")
        
        try:
            # Try to load the specified template
            with open(template_path, "r") as file:
                logger.info(f"Loaded template from {template_path}")
                return file.read()
        except FileNotFoundError:
            # If the template doesn't exist, log a warning and use the standard template
            logger.warning(f"Template {template_type} not found. Using standard template.")
            standard_path = os.path.join(template_dir, "standard.txt")
            
            try:
                with open(standard_path, "r") as file:
                    return file.read()
            except FileNotFoundError:
                # If even the standard template doesn't exist, return a basic template
                logger.error(f"Standard template not found at {standard_path}. Using built-in fallback.")
                return """
                System: You are an expert RFP analyzer. Extract information from the RFP and return it ONLY as a valid JSON object.
                
                Documents:
                {% for doc in documents %}
                    {{ doc.content }}
                {% endfor %}
                
                Question: {{ query }}
                
                Return a JSON object with key information from the RFP.
                """

    async def analyze_rfp(self, text: str, template_type="standard", pdf_path=None) -> Dict[str, Any]:
        """
        Build a pipeline to extract key RFP information and format it as JSON.
        
        Args:
            text: The RFP text to analyze
            template_type: The type of template to use (standard, technical, government, etc.)
            pdf_path: Optional path to the PDF file
        """
        try:
            # Get session ID from the vector store if available
            session_id = getattr(self.vector_store, 'session_id', None)
            logger.info(f"Analyzing RFP for session: {session_id} using template: {template_type}")
            
            # Check cache if we have a session ID
            cache_key = f"{session_id}_{template_type}" if session_id else None
            if cache_key and cache_key in analysis_cache:
                logger.info(f"Using cached analysis for session {session_id} with template {template_type}")
                return analysis_cache[cache_key]
            
            # Log that we're creating a new analysis
            logger.info(f"Creating new RFP analysis with dedicated API key using template: {template_type}")
            
            # Load the appropriate template
            query_template = self._load_template(template_type)
            
            # First, get the embedding for our query text
            embed_pipeline = Pipeline()
            embed_pipeline.add_component(
                "text_embedder",
                OpenAITextEmbedder(
                    api_key=Secret.from_token(self.api_key),
                    model="text-embedding-3-small"
                )
            )
            
            # Get the embedding
            embed_result = embed_pipeline.run({
                "text_embedder": {
                    "text": text
                }
            })
            if not embed_result.get("text_embedder", {}).get("embedding"):
                print("No embedding generated")
                return {}
            
            # Extract the embedding vector
            query_embedding = embed_result["text_embedder"]["embedding"]

            # Now use this embedding to query Pinecone
            query_pipeline = Pipeline()
            query_pipeline.add_component(
                "retriever",
                PineconeEmbeddingRetriever(
                    document_store=self.vector_store,
                    top_k=40
                )
            )
            query_pipeline.add_component("prompt_builder", PromptBuilder(template=query_template))
            query_pipeline.add_component(
                "llm",
                OpenAIGenerator(
                    api_key=Secret.from_token(self.api_key),
                    model="gpt-4.1",
                    generation_kwargs={
                        "max_tokens": 16384,
                        "timeout": 180

                    }
                )
            )

            # Connect the components
            query_pipeline.connect("retriever.documents", "prompt_builder.documents")
            query_pipeline.connect("prompt_builder.prompt", "llm.prompt")

            # Run the retrieval and LLM pipeline
            result = query_pipeline.run({
                "retriever": {"query_embedding": query_embedding},
                "prompt_builder": {
                    "query": "Extract all key information from this RFP document."
                }
            })

            # Count tokens in retrieved documents
            if "retriever" in result and "documents" in result["retriever"]:
                retrieved_docs = result["retriever"]["documents"]
                logger.info(f"Retrieved {len(retrieved_docs)} documents")
                # Log document sources
                doc_sources = {}
                for doc in retrieved_docs:
                    if hasattr(doc, 'metadata') and doc.metadata:
                        filename = doc.metadata.get('filename', 'unknown')
                        doc_sources[filename] = doc_sources.get(filename, 0) + 1
                
                logger.info(f"Document sources: {doc_sources}")

            # Add debug prints
            print("Full result:", result)
            print("LLM result:", result.get("llm", {}))
            print("Raw reply:", result.get("llm", {}).get("replies", []))

            if isinstance(result.get("llm", {}).get("replies"), list) and result["llm"]["replies"]:
                raw_reply = result["llm"]["replies"][0]
                print("Raw reply content:", raw_reply)
                
                try:
                    # First try to clean the reply with our sanitizer
                    cleaned_reply = sanitize_json_response(raw_reply)
                    parsed_reply = json.loads(cleaned_reply)
                    
                    # Cache the result if we have a session ID
                    if session_id:
                        analysis_cache[session_id] = parsed_reply
                    
                    return parsed_reply
                except json.JSONDecodeError as parse_error:
                    # If that fails, try a more aggressive approach
                    print(f"First parsing attempt failed: {parse_error}")
                    try:
                        # Try to extract just what looks like JSON
                        import re
                        potential_json = re.search(r'(\{.*\})', raw_reply, re.DOTALL)
                        if potential_json:
                            second_attempt = potential_json.group(1)
                            parsed_reply = json.loads(second_attempt)
                            
                            # Cache the result if we have a session ID
                            if session_id:
                                analysis_cache[session_id] = parsed_reply
                            
                            return parsed_reply
                    except Exception as e:
                        print(f"Second parsing attempt failed: {e}")
                    
                    # If all parsing attempts fail
                    print(f"Failed to parse LLM reply as JSON: {parse_error}")
                    return {
                        "error": f"Failed to parse LLM reply: {str(parse_error)}",
                        "raw_reply": raw_reply[:1000]  # Include part of the raw reply for debugging
                    }
            return {"error": "No reply from LLM"}

        except Exception as e:
            print(f"Error in analyze_rfp: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return {"error": str(e)}

    async def generate_bid_matrix(self, rfp_info: Dict) -> Dict[str, Any]:
        """Generate a detailed bid matrix from RFP information"""
        try:
            # Extract values from the new nested structure
            def get_value(section, key):
                if section in rfp_info and key in rfp_info[section]:
                    item = rfp_info[section][key]
                    if isinstance(item, dict) and "value" in item:
                        return item["value"]
                    return item  # For backward compatibility
                return "Not specified"
            
            matrix = {
                "sections": [
                    {
                        "name": "Project Overview",
                        "items": [
                            {
                                "category": "Budget",
                                "requirement": get_value("commercials", "budget"),
                                "priority": "High",
                                "status": "To Review",
                                "notes": "Compare with past successful bids in this range"
                            },
                            {
                                "category": "Deadline",
                                "requirement": get_value("key_dates", "submission_deadline"),
                                "priority": "High",
                                "status": "To Review",
                                "notes": "Assess resource availability for timeline"
                            }
                        ]
                    },
                    {
                        "name": "Technical Requirements",
                        "items": [
                            {
                                "category": "Requirement",
                                "requirement": req,
                                "priority": "Medium",
                                "status": "To Review",
                                "notes": "Evaluate against technical capabilities"
                            } for req in rfp_info.get("technical_requirements", [])
                        ]
                    },
                    {
                        "name": "Required Skills",
                        "items": [
                            {
                                "category": "Skill",
                                "requirement": skill,
                                "priority": "High",
                                "status": "To Review",
                                "notes": "Check team availability and expertise"
                            } for skill in rfp_info.get("skills_needed", [])
                        ]
                    }
                ]
            }
            return matrix
        except Exception as e:
            print(f"Error generating bid matrix: {str(e)}")
            raise Exception(f"Failed to generate bid matrix: {str(e)}")