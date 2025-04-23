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
    from .dummy_data import folder_list_raw_dummy

    # Use provided values or fallback
    question_list = questions if questions else IC_Questions
    total_questions = len(question_list)
    
    # Check if folder is a path string or the dummy data
    if isinstance(folder, dict):
        if 'path' in folder and os.path.exists(folder['path']):
            # It's a folder object with a valid path
            folder_path = folder['path']
            pdf_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) 
                        if f.lower().endswith('.pdf')]
            
            if pdf_files:
                print(f"Found {len(pdf_files)} PDF files in {folder_path}")
                rag_chain = build_rag_chain_from_pdfs(pdf_files)
            else:
                print(f"No PDF files found in {folder_path}")
                rag_chain = build_rag_chain_from_pdfs(folder_list_raw_dummy)
        else:
            # Use the dummy data
            print("Using dummy data for RAG chain")
            rag_chain = build_rag_chain_from_pdfs(folder_list_raw_dummy)
    elif isinstance(folder, str) and os.path.exists(folder):
        # It's a direct path string
        if os.path.isdir(folder):
            pdf_files = [os.path.join(folder, f) for f in os.listdir(folder) 
                        if f.lower().endswith('.pdf')]
        else:
            # It's a direct file path
            pdf_files = [folder] if folder.lower().endswith('.pdf') else []
            
        if pdf_files:
            print(f"Using {len(pdf_files)} PDF files for analysis")
            rag_chain = build_rag_chain_from_pdfs(pdf_files)
        else:
            print("No PDF files found, using dummy data")
            rag_chain = build_rag_chain_from_pdfs(folder_list_raw_dummy)
    else:
        # Use the dummy data as fallback
        print("Using dummy data (fallback) for RAG chain")
        rag_chain = build_rag_chain_from_pdfs(folder_list_raw_dummy)

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

    for idx, question in enumerate(question_list):
        current_question_num = idx + 1
        yield json.dumps({"type": "progress", "current": current_question_num, "total": total_questions})
        try:
            rag_response = rag(question)
            web_response = web(question)

            prior_context = ""
            if context_store:
                safe_context = []
                for i, item in enumerate(list(context_store.items())[-2:]):
                    q_prev, r_prev = item
                    if isinstance(q_prev, str) and isinstance(r_prev, dict):
                        rag_snip = r_prev.get("step_1", {}).get("step_output", "")[:1000]
                        web_snip = r_prev.get("step_2", {}).get("step_output", "")[:1000]
                        safe_context.append(f"Q{i+1}: {q_prev}\nRAG: {rag_snip}\nWEB: {web_snip}")
                prior_context = "\n\n".join(safe_context)

            appraisal_output = analyst(question, rag_response, web_response, prior_context)

            # Add this right after getting the appraisal output
            print(f"Question {idx+1} appraisal starts with: {appraisal_output[:100]}...")

            # Extract sections from the analyst output
            parsed_sections = extract_sections_from_appraisal(appraisal_output)
            score = parsed_sections["score"]
            parsed_appraisal = {
                "score": score,
                "scoring": parsed_sections["scoring"],
                "sources": {},
                "agent_commentary": parsed_sections["agent_commentary"]
            }

            final_json_output[f"question_{idx+1}"] = {
                "question_text": question,
                "score": score,
                "scoring": parsed_appraisal.get("scoring", ""),
                "sources": parsed_appraisal.get("sources", {}),
                "rationale": {
                    "rag_response": rag_response,
                    "web_response": web_response,
                    "agent_commentary": safe_parse_agent_commentary(parsed_appraisal.get("agent_commentary"))
                }
            }

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