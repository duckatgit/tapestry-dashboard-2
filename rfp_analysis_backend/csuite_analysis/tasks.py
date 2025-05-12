from .questions import IC_Questions, response_guidelines
from .dummy_data import folder_list_raw_dummy
from .pipeline import build_rag_chain_from_pdfs
from .agent_tools import rag_tool, web_search_tool, analyst_appraisal_tool
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
import os
import re  # Add import for regex
import json # Add json import


def run_agent_analysis(questions=None, folder=None):
    from .questions import IC_Questions  # keep this import here for default fallback
    
    if questions is None:
        questions = IC_Questions

    # Extract PDF files from Tapestry folder data
    pdf_files = []
    if folder and isinstance(folder, dict):
        docs = folder.get("body", {}).get("docs", [])
        for doc in docs:
            if doc.get("file_type", "").lower() == "pdf":
                name = doc.get("Document_name")
                url = doc.get("file_id")
                if name and url:
                    pdf_files.append({
                        "file_name": name,
                        "file_type": "pdf",
                        "file_url": url
                    })
    
    if not pdf_files:
        yield json.dumps({"type": "error", "message": "No PDF files found in folder"})
        return

    # Build RAG chain from PDFs
    rag_chain = build_rag_chain_from_pdfs(pdf_files)
    if not rag_chain:
        yield json.dumps({"type": "error", "message": "Failed to build RAG chain"})
        return

    # Init tools
    rag = rag_tool(rag_chain)
    web = web_search_tool()
    analyst = analyst_appraisal_tool()

    output_parser = StructuredOutputParser.from_response_schemas([
        ResponseSchema(name="score", description="Score from 1 to 5"),
        ResponseSchema(name="scoring", description="Analyst logic and reasoning"),
        ResponseSchema(name="sources", description="List of sources with title and location")
    ])

    final_json_output = {}
    context_store = {}
    total_questions = len(questions)

    for idx, question in enumerate(questions):
        # Send progress update
        yield json.dumps({
            "type": "progress",
            "current": idx + 1,
            "total": total_questions
        })

        try:
            # Step 1: RAG Tool
            rag_response = rag(question)
            
            # Step 2: Web Validation
            web_response = web(question)
            
            # Step 3: Analyst Appraisal
            prior_context = ""
            if context_store:
                safe_context = []
                for i, item in enumerate(list(context_store.items())[-2:]):
                    if isinstance(item, tuple) and len(item) == 2:
                        q_prev, r_prev = item
                        if isinstance(q_prev, str) and isinstance(r_prev, dict):
                            rag_snip = r_prev.get("step_1", {}).get("step_output", "")[:1000]
                            web_snip = r_prev.get("step_2", {}).get("step_output", "")[:1000]
                            safe_context.append(f"Q{i+1}: {q_prev}\nRAG: {rag_snip}\nWEB: {web_snip}")
                prior_context = "\n\n".join(safe_context)

            appraisal_output = analyst(
                question=question,
                rag_response=rag_response,
                web_response=web_response,
                context=prior_context
            )

            # Parse appraisal output
            try:
                parsed_appraisal = output_parser.parse(appraisal_output)
            except Exception as e:
                parsed_appraisal = {
                    "score": None,
                    "scoring": appraisal_output,
                    "sources": {},
                    "agent_commentary": f"Parsing failed: {str(e)}"
                }

            # Handle source parsing
            raw_sources = parsed_appraisal.get("sources", "")
            source_dict = {}
            if isinstance(raw_sources, str):
                for line in raw_sources.strip().split("\n"):
                    if line:
                        if "http" in line:
                            try:
                                name, url = line.rsplit("(", 1)
                                source_dict[name.strip()] = url.strip("() ")
                            except:
                                source_dict[line.strip()] = None
                        else:
                            source_dict[line.strip()] = None
            elif isinstance(raw_sources, list):
                for src in raw_sources:
                    if isinstance(src, dict) and "title" in src and "location" in src:
                        source_dict[src["title"]] = src["location"]

            # Store results
            final_json_output[f"question_{idx+1}"] = {
                "question_text": question,
                "score": int(parsed_appraisal.get("score") or 0),
                "scoring": parsed_appraisal.get("scoring", ""),
                "sources": source_dict,
                "rationale": {
                    "rag_response": rag_response,
                    "web_response": web_response,
                    "agent_commentary": parsed_appraisal.get("agent_commentary", "")
                }
            }

            # Update context
            context_store[question] = {
                "step_1": {"step_output": rag_response},
                "step_2": {"step_output": web_response},
                "step_3": parsed_appraisal
            }

        except Exception as e:
            final_json_output[f"question_{idx+1}"] = {
                "question_text": question,
                "score": 0,
                "scoring": "Error during processing",
                "sources": {},
                "rationale": {
                    "rag_response": "",
                    "web_response": "",
                    "agent_commentary": str(e)
                }
            }

    # Yield final results
    yield json.dumps({"type": "complete", "results": final_json_output})

# Add this function to extract sections from the analyst output
def extract_sections_from_appraisal(text):
    """Extract score, appraisal, and agent commentary from the analyst output."""
    result = {
        "score": 0,
        "scoring": "",
        "agent_commentary": ""
    }
    
    # Extract score
    score_match = re.search(r'[Ss]core:?\s*(\d+)(?:\s*\/\s*|\s+out\s+of\s+)5', text)
    if score_match:
        result["score"] = int(score_match.group(1))
    
    # Extract appraisal section
    appraisal_match = re.search(r'Appraisal:(.*?)(?:Agent Commentary:|$)', text, re.DOTALL)
    if appraisal_match:
        result["scoring"] = appraisal_match.group(1).strip()
    else:
        # If no appraisal section found, use everything after the score as the appraisal
        score_end = text.find("Score:") + 10 if "Score:" in text else 0
        result["scoring"] = text[score_end:].strip()
    
    # Extract agent commentary
    commentary_match = re.search(r'Agent Commentary:(.*?)$', text, re.DOTALL)
    if commentary_match:
        result["agent_commentary"] = commentary_match.group(1).strip()
    
    return result

# Add this function to safely parse the agent commentary
def safe_parse_agent_commentary(commentary_text):
    """Safely parse agent commentary, handling potential JSON errors."""
    if not commentary_text:
        return None
        
    # If it's already a string, just return it
    if isinstance(commentary_text, str):
        return commentary_text
        
    # If it's some other object, try to convert it to a string
    try:
        return str(commentary_text)
    except:
        return "Agent commentary could not be parsed."