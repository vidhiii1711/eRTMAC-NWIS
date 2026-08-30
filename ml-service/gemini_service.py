import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE, override=True)

api_key = os.getenv("GEMINI_API_KEY", "").strip()

if not api_key:
    raise ValueError(
        f"GEMINI_API_KEY not found in {ENV_FILE}"
    )

client = genai.Client(
    api_key=api_key
)

MODEL_NAME = "gemini-3.6-flash"

DOCUMENT_FOLDER = (
    Path(__file__).resolve().parent / "wcr_ddr_pdf"
)
# DOCUMENT_FOLDER = Path("wcr_ddr_pdf")

def upload_documents():

    uploaded_documents = []
    if not DOCUMENT_FOLDER.exists():
        raise FileNotFoundError(
            f"Folder not found: {DOCUMENT_FOLDER}"
        )
    pdf_files = list(
        DOCUMENT_FOLDER.glob("*.pdf")
    )
    if not pdf_files:
        raise FileNotFoundError(
            "No PDF files found inside wcr_ddr_pdf folder."
        )
    for pdf in pdf_files:
        try:
            uploaded_file = client.files.upload(
                file=pdf
            )
            uploaded_documents.append({
                "name": pdf.name,
                "file": uploaded_file
            })
            print(
                f"Uploaded: {pdf.name}"
            )
        except Exception as e:
            print(
                f"Error uploading {pdf.name}: {e}"
            )
    return uploaded_documents

def get_well_documents(documents, well_ids):

    selected_documents = []
    if not well_ids:
        return selected_documents
    for document in documents:
        filename = document["name"].lower()
        for well_id in well_ids:
            if str(well_id).lower() in filename:
                selected_documents.append(document)
                break
    return selected_documents

def ask_historical_question(
    question,
    documents,
    well_ids=None
):

    if not documents:
        return (
            "No WCR/DDR documents are available "
            "in the system."
        )

    selected_documents = []
    if well_ids:
        selected_documents = get_well_documents(
            documents,
            well_ids
        )
    
    if selected_documents:

        document_mode = (
            "SPECIFIC WELL DOCUMENTS"
        )
        print(
            f"Found {len(selected_documents)} "
            f"matching WCR/DDR document(s)."
        )
        for document in selected_documents:
            print(
                f"Using: {document['name']}"
            )

    else:
        selected_documents = documents
        document_mode = (
            "ALL AVAILABLE WCR/DDR DOCUMENTS"
        )
        print(
            "No specific matching Well_ID documents found."
        )
        print(
            "Fallback activated: using ALL WCR/DDR documents."
        )
        for document in selected_documents:
            print(
                f"Using: {document['name']}"
            )

    prompt = f"""
You are the Historical Drilling Intelligence
Assistant for an oil and gas decision-support
system called NWIS.

You are given historical WCR (Well Completion Report)
and DDR (Daily Drilling Report) documents.

DOCUMENT SELECTION MODE:
{document_mode}

The documents attached to this request are the
available historical evidence that you must use
to answer the user's question.

IMPORTANT RULES:

1. Answer the user's question using the provided
   WCR/DDR documents.

2. NEVER say that documents are unavailable if
   documents have been provided to you.

3. If specific well documents were found, focus
   primarily on those documents.

4. If specific well documents were NOT found,
   ALL provided WCR/DDR documents are being used
   as fallback historical evidence.

5. When using all documents as fallback, search
   across the provided documents and identify the
   most relevant wells, events, depths and actions
   related to the user's question.

6. Do not invent facts, events, depths, Well IDs,
   engineering actions or outcomes.

7. Only state information that can be supported
   by the provided documents.

8. If the exact answer is not explicitly available,
   explain what relevant information IS available
   in the documents instead of simply saying
   "documents are not available."

9. Mention the Well ID whenever available.

10. Mention the depth whenever available.

11. When relevant, explain:
    - What happened?
    - At what depth?
    - Which well?
    - What problem/event occurred?
    - What did engineers do?
    - What was the outcome?

12. If multiple wells experienced similar events,
    compare them briefly.

13. If the question asks about a particular depth,
    formation, drilling event or problem, prioritize
    evidence related to that context.

14. Give a concise, practical answer suitable for
    drilling engineers.

15. Do not discuss this document-selection process
    unless it is useful to explain the answer.

USER QUESTION:

{question}
"""

    contents = [prompt]

    for document in selected_documents:
        contents.append(
            f"\nDOCUMENT: {document['name']}"
        )
        contents.append(
            document["file"]
        )

    try:
        chat = client.chats.create(
        model=MODEL_NAME
    )

        response = chat.send_message(
        contents
    )

        return response.text

    except Exception as e:
       return f"Gemini error: {str(e)}"