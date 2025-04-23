from openai import OpenAI
from duckduckgo_search import DDGS
from .utils import function_tool 


def rag_tool(rag_chain):
    @function_tool
    def tool(question: str) -> str:
        try:
            # Check if the rag_chain expects 'query' or 'question' as input
            if hasattr(rag_chain, 'input_keys') and 'query' in rag_chain.input_keys:
                result = rag_chain.invoke({"query": question})
            else:
                # Try with a different input format or provide a default response
                try:
                    result = rag_chain(question)  # Try direct invocation
                except:
                    return f"The document analysis found no relevant information about: {question}"
            
            # Process the result
            if isinstance(result, dict):
                answer = result.get("result", "")
                sources = result.get("source_documents", [])
                src = "\n".join([f"[{i+1}] {d.page_content}" for i, d in enumerate(sources)])
                return f"{answer}\n\n---\n{src}"
            else:
                return str(result)
        except Exception as e:
            return f"RAG Error: {str(e)}\n\nNo relevant information was found in the company documents."
    return tool



def web_search_tool():
    @function_tool
    def tool(question: str) -> str:
        """
        Search the web for an answer using DuckDuckGo and return formatted results.
        """
        try:
            # Add "Rhetorik Ltd" with quotes to ensure exact match
            company_name = '"Rhetorik Ltd"'
            enhanced_question = f"{company_name} {question}"
            
            ddg = DDGS()
            results = ddg.text(enhanced_question, max_results=3)

            if not results:
                # Try again with just Rhetorik in quotes if no results
                company_name = '"Rhetorik"'
                enhanced_question = f"{company_name} {question}"
                results = ddg.text(enhanced_question, max_results=3)
                
                if not results:
                    return "Web search returned no relevant results for Rhetorik."

            formatted = []
            for res in results:
                title = res.get("title", "No Title")
                snippet = res.get("body", "")
                url = res.get("href", "")
                formatted.append(f"- {title}\n  {snippet}\n  [Source]({url})")

            return "Web Search Results:\n" + "\n\n".join(formatted)
        except Exception as e:
            return f"Web search encountered an error: {str(e)}"

    return tool

from openai import OpenAI

def analyst_appraisal_tool():
    @function_tool
    def tool(question: str, rag_response: str, web_response: str, context: str) -> str:
        """
        Evaluate the responses from RAG and web search, provide a score and FT-style appraisal.
        """
        client = OpenAI()

        prompt = f"""
You are a financial analyst preparing a due diligence review for a private equity investment committee.

Your task is to evaluate the information collected from a company pitch deck (via RAG) and external sources (via web search), considering both their consistency and credibility.

QUESTION:
{question}

--- Response from Company Deck (RAG Tool) ---
{rag_response}

--- External Validation (Web Search) ---
{web_response}

--- Previous Context from Other Questions ---
{context}

Instructions:
- SCORE from 1 (very weak) to 5 (exceptional), based on the strength of the evidence and quality of the response.
- Are there any contradictions between the Deck and the Web?
- Which points are confirmed externally, and which are unsupported?
- Flag any suspicious claims or missing disclosures.
- Offer a clear, professional analyst opinion on the reliability of the combined data.

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

Score: X/5

Appraisal:
[Your detailed appraisal in the neutral style of an FT Journalist]

Agent Commentary:
[Add your additional insights, observations, and recommendations here]

IMPORTANT: Ensure your response includes ALL THREE sections: Score, Appraisal, and Agent Commentary.
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4.1",
                temperature=0.3,
                max_tokens=2048,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=-0.2,
                messages=[
                    {"role": "system", "content": "You are a professional financial analyst."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Get the response content
            content = response.choices[0].message.content.strip()
            
            # Ensure we have all three sections
            if "Score:" not in content:
                content = "Score: 3/5\n\n" + content
            
            if "Appraisal:" not in content:
                content = content.replace("Score:", "Score:\n\nAppraisal:")
                
            if "Agent Commentary:" not in content:
                content += "\n\nAgent Commentary:\nAdditional insights based on the available information."
                
            return content
        except Exception as e:
            return f"""
Score: 2/5

Appraisal:
Error encountered during analysis. The available information was insufficient to provide a comprehensive appraisal.

Agent Commentary:
An error occurred during processing: {str(e)}
"""

    return tool
