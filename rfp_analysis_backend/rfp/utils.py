from haystack.document_stores import InMemoryDocumentStore
from haystack.dataclasses import Document
from openai import OpenAI
import os

def get_document_store(doc_id):
    # For testing, delete after testing
    document_store = InMemoryDocumentStore()
    
    # Get the document content from your storage
    documents = [
        Document(
            content=your_stored_content,  # Get this from your database/storage
            metadata={"doc_id": doc_id}
        )
    ]
    
    # Write documents to the document store
    document_store.write_documents(documents)
    
    return document_store 

def check_model_limits():
    """Check and log the token limits for the GPT-4o model."""
    try:
        client = OpenAI(api_key=os.getenv("BID_QUALIFIER_OPENAI_API_KEY"))
        models = client.models.list()
        
        # Find GPT-4o in the list
        for model in models.data:
            if "gpt-4.1" in model.id:
                print(f"Model: {model.id}")
                print(f"Context window: {getattr(model, 'context_window', 'Not specified')}")
                print(f"Max tokens: {getattr(model, 'max_tokens', 'Not specified')}")
                
        return True
    except Exception as e:
        print(f"Error checking model limits: {e}")
        return False 