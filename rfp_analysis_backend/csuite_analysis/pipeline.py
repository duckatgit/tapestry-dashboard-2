from .dummy_data import extract_pdf_files
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters.character import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import PromptTemplate

import os
import re
import requests
from urllib.parse import urlparse

def is_valid_url(url):
    parsed = urlparse(url)
    return all([parsed.scheme, parsed.netloc])

def process_pdf_path(pdf_path_list):
    local_paths = []
    for pdf in pdf_path_list:
        file_url = "https://tapestrybucket.s3.amazonaws.com/f7fdf600-1b8d-11f0-9f40-6bd8d9df71c4.pdf"
        if not is_valid_url(file_url):
            continue
        response = requests.get(file_url)
        if response.status_code == 200: 
            temp_path = os.path.join('/tmp', pdf['file_name'])
            print(temp_path, 'temp_path')
            # temp_path = pdf['file_name']
            with open(temp_path, 'wb') as f:
                f.write(response.content)
            local_paths.append(temp_path)
    return local_paths

def build_rag_chain_from_pdfs(folder_data):
    """Build a RAG chain from PDF files"""
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters.character import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    from langchain.chains import RetrievalQA
    # from langchain.chat_models import ChatOpenAI
    
    try:
        # Handle different input formats
        documents = []
        
        # Case 1: folder_data is a list of file paths (strings)
        if isinstance(folder_data, list) and all(isinstance(item, str) for item in folder_data):
            for file_path in folder_data:
                try:
                    loader = PyPDFLoader(file_path)
                    documents.extend(loader.load())
                except Exception as e:
                    print(f"Error loading PDF from path {file_path}: {str(e)}")
        
        # Case 2: folder_data is the raw folder data structure
        elif isinstance(folder_data, dict) and "body" in folder_data:
            pdf_files = extract_pdf_files(folder_data)
            local_paths = process_pdf_path(pdf_files)
            
            for pdf in local_paths:
                try:
                    url = "https://tapestrybucket.s3.amazonaws.com/f7fdf600-1b8d-11f0-9f40-6bd8d9df71c4.pdf"
                    if url:
                        loader = PyPDFLoader(url)
                        documents.extend(loader.load())
                except Exception as e:
                    print(f"Error loading PDF from URL {pdf.get('file_url')}: {str(e)}")
        
        # If no documents were loaded, return a simple chain that returns a default message
        if not documents:
            def simple_chain(query):
                return {
                    "result": "No documents were found or could be processed.",
                    "source_documents": []
                }
            simple_chain.invoke = lambda x: simple_chain(x.get("query", ""))
            return simple_chain
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)
        
        # Create vector store
        embeddings = OpenAIEmbeddings()
        vectorstore = FAISS.from_documents(chunks, embeddings)
        
        # Create retriever
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        
        # Create QA chain
        llm = ChatOpenAI(model="gpt-4.1", temperature=0)
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )
        
        return qa_chain
    
    except Exception as e:
        print(f"Error building RAG chain: {str(e)}")
        
        # Return a simple function that acts like a chain but just returns an error message
        def error_chain(query):
            return {
                "result": f"Error processing documents: {str(e)}",
                "source_documents": []
            }
        error_chain.invoke = lambda x: error_chain(x.get("query", ""))
        return error_chain
