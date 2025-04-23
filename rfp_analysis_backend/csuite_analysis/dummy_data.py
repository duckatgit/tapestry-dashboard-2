# csuite_analysis/dummy_data.py

def extract_pdf_files(folder_list_raw):
    pdf_files = []
    docs = folder_list_raw.get("body", {}).get("docs", [])
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
    return pdf_files


folder_list_raw_dummy = {
    "success": True,
    "code": 200,
    "message": "Library",
    "body": {
        "total_count": 1,
        "docs": [
            {
                "Document_name": "Rhetorik Investor Deck_Sep'24.3.pdf",
                "file_type": "pdf",
                "file_id": "https://tapestrybucket.s3.amazonaws.com/f7fdf600-1b8d-11f0-9f40-6bd8d9df71c4.pdf"
            }
        ]
    }
}

# Sample local folders for C-Suite analysis
local_folders = [
    {
        "id": "rhetorik",
        "name": "Rhetorik",
        "path": "./sample_data"
    }
]
