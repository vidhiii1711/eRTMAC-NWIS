import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
STORE_FILE = BASE_DIR / "file_search_store.txt"

load_dotenv(ENV_FILE, override=True)

api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    raise ValueError(
        f"GEMINI_API_KEY not found in {ENV_FILE}"
    )

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.6-flash"

STORE_DISPLAY_NAME = ("NWIS Historical WCR DDR Documents V2")

def get_store_name():
    # First try local file
    if STORE_FILE.exists():
        with open(STORE_FILE,"r",encoding="utf-8") as f:
            store_name = f.read().strip()
        if store_name:
            return store_name
    # If local file doesn't exist, search Gemini for the store
    print("\nFile Search Store ID not found locally.")
    print("Searching Gemini for existing store...")

    try:
        for store in client.file_search_stores.list():
            display_name = getattr(store,"display_name","")
            if display_name == STORE_DISPLAY_NAME:
                store_name = store.name
                # Save store name locally
                with open(STORE_FILE,"w",encoding="utf-8") as f:
                    f.write(store_name)
                print(
                    f"Found File Search Store: "
                    f"{store_name}"
                )
                return store_name
    except Exception as e:
        raise RuntimeError(f"Unable to find File Search Store: {e}")
    
    # Store doesn't exist
    raise RuntimeError(
        "\nNWIS File Search Store was not found.\n\n"
        "Please create the store and index your PDFs "
        "before using historical intelligence."
    )
  
# NORMALIZE WELL IDS

def normalize_well_ids(well_ids):

    if not well_ids:
        return []

    if isinstance(
        well_ids,
        str
    ):
        return [well_ids]

    return [
        str(well_id)
        for well_id in well_ids
        if well_id
    ]

# BUILD WELL FILTER

def build_metadata_filter(well_ids):

    well_ids = normalize_well_ids(
        well_ids
    )

    if not well_ids:
        return None

    # One Well ID

    if len(well_ids) == 1:

        return (
            f'Well_ID="{well_ids[0]}"'
        )

    # Multiple Well IDs

    conditions = [
        f'Well_ID="{well_id}"'
        for well_id in well_ids
    ]

    return " OR ".join(
        conditions
    )

def ask_historical_question(question,documents=None,well_ids=None):

    # Get persistent File Search Store

    try:
        store_name = get_store_name()
    except Exception as e:
        return (
            f"Historical document system error: "
            f"{str(e)}"
        )

    # Normalize Well IDs

    well_ids = normalize_well_ids(well_ids)
    # Determine search mode

    metadata_filter = (build_metadata_filter(well_ids))
    if metadata_filter:
        document_mode = (
            "SPECIFIC WELL DOCUMENTS"
        )
        print("\n========================================")
        print("Historical Search Mode:")
        print("SPECIFIC WELL DOCUMENTS")
        print(f"Well IDs: {well_ids}")
        print(f"Metadata filter: {metadata_filter}")
        print("========================================")
    else:
        document_mode = ("ALL AVAILABLE WCR/DDR DOCUMENTS")
        print("\n========================================")
        print("Historical Search Mode:")
        print("ALL AVAILABLE WCR/DDR DOCUMENTS")
        print("========================================")

    # PROMPT

    prompt = f"""
You are the Historical Drilling Intelligence
Assistant for an oil and gas decision-support
system called NWIS.

You have access to historical WCR
(Well Completion Report) and DDR
(Daily Drilling Report) documents through
the document search system.

DOCUMENT SEARCH MODE:
{document_mode}

IMPORTANT RULES:

1. Answer the user's question using only
   information supported by the retrieved
   WCR/DDR documents.

2. NEVER invent facts, events, depths,
   Well IDs, formations, engineering actions,
   causes or outcomes.

3. Mention the Well ID whenever available.

4. Mention the depth whenever available.

5. When relevant, explain:
   - What happened?
   - At what depth?
   - Which well?
   - What problem/event occurred?
   - What did engineers do?
   - What was the outcome?

6. If multiple wells experienced similar
   events, compare them briefly.

7. If the question concerns a particular
   depth, formation, drilling event or problem,
   prioritize evidence related to that context.

8. If an exact answer is not available,
   provide the closest relevant historical
   evidence instead of simply saying that
   documents are unavailable.

9. Keep the answer concise and practical
   for drilling engineers.

10. Do not explain the internal document
    retrieval process unless necessary.

USER QUESTION:

{question}
"""
    # FILE SEARCH TOOL
    file_search_tool = {
        "type": "file_search",
        "file_search_store_names": [
            store_name
        ]
    }
 # Add Well ID filter if available

    if metadata_filter:

        file_search_tool[
            "metadata_filter"
        ] = metadata_filter
    # SEND REQUEST
    try:
        print("\nSearching historical documents...")
        response = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
            tools=[file_search_tool]
        )
        # GET RESPONSE TEXT
        response_text = ""
        for step in response.steps:
            if (getattr(step,"type",None)== "model_output"):
                for content in (getattr(
                        step,
                        "content",
                        []
                    )
                ):
                    if (
                        getattr(
                            content,
                            "type",
                            None
                        )
                        == "text"
                    ):
                        text = getattr(
                            content,
                            "text",
                            ""
                        )

                        response_text += text
        if not response_text:
            return (
                "Gemini did not return "
                "a response."
            )
        print(
            "\nHistorical response generated."
        )
        return response_text.strip()
    except Exception as e:
        return (
            f"Gemini error: {str(e)}"
        )