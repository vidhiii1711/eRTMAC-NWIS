import os
import time
from pathlib import Path
from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
DOCUMENT_FOLDER = BASE_DIR / "wcr_ddr_pdf"

load_dotenv(ENV_FILE, override=True)
api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    raise ValueError(
        f"GEMINI_API_KEY not found in {ENV_FILE}"
    )

client = genai.Client(api_key=api_key)

STORE_DISPLAY_NAME = "NWIS Historical WCR DDR Documents"

def find_existing_store():
    print("\nSearching for existing File Search Store...")
    try:
        for store in client.file_search_stores.list():
            print(
                f"Found store: "
                f"{getattr(store, 'display_name', '')}"
            )
            if (
                getattr(store, "display_name", "")
                == STORE_DISPLAY_NAME
            ):
                print(
                    f"\nUsing existing store:"
                    f"\n{store.name}"
                )
                return store
    except Exception as e:
        print(
            f"Error while searching stores: {e}"
        )
    return None

def create_store():
    print("\nCreating new Gemini File Search Store...")
    store = client.file_search_stores.create(
        config={
            "display_name":
                STORE_DISPLAY_NAME,
            "embedding_model":
                "models/gemini-embedding-2"
        }
    )
    print(
        "\nFile Search Store created:"
    )
    print(store.name)
    return store

def upload_documents(store):
    if not DOCUMENT_FOLDER.exists():
        raise FileNotFoundError(
            f"Folder not found: "
            f"{DOCUMENT_FOLDER}"
        )
    pdf_files = list(
        DOCUMENT_FOLDER.glob("*.pdf")
    )
    if not pdf_files:
        raise FileNotFoundError(
            "No PDF files found inside "
            "wcr_ddr_pdf folder."
        )
    print(
        f"\nFound {len(pdf_files)} PDF files."
    )
    print(
        "\nStarting document indexing..."
    )
    for pdf in pdf_files:
        print(
            f"\nIndexing: {pdf.name}"
        )
        try:
            # ------------------------------------------------
            # Determine Well ID from filename
            #
            # Example:
            # W001_WCR.pdf -> W001
            # W002_DDR.pdf -> W002
            # ------------------------------------------------
            filename_without_extension = (
                pdf.stem
            )
            parts = (
                filename_without_extension
                .split("_")
            )
            well_id = parts[0]
            # Determine document type
            document_type = "UNKNOWN"

            upper_name = (
                filename_without_extension
                .upper()
            )

            if "WCR" in upper_name:

                document_type = "WCR"

            elif "DDR" in upper_name:

                document_type = "DDR"

            print(
                f"Well ID: {well_id}"
            )

            print(
                f"Document type: {document_type}"
            )
            operation = (
                client.file_search_stores
                .upload_to_file_search_store(

                    file=str(pdf),

                    file_search_store_name=
                        store.name,

                    config={

                        "display_name":
                            pdf.name,

                        "custom_metadata": [

                            {
                                "key":
                                    "Well_ID",

                                "string_value":
                                    well_id
                            },

                            {
                                "key":
                                    "Document_Type",

                                "string_value":
                                    document_type
                            }
                        ]
                    }
                )
            )

            while not operation.done:
                print(
                    "  Indexing..."
                )
                time.sleep(3)
                operation = (
                    client.operations.get(
                        operation
                    )
                )
            print(
                f"  Successfully indexed: "
                f"{pdf.name}"
            )
        except Exception as e:

            print(
                f"  ERROR indexing "
                f"{pdf.name}: {e}"
            )
def main():

    print("\n========================================")
    print("NWIS HISTORICAL DOCUMENT SETUP")
    print("========================================")
    store = find_existing_store()
    if store is None:
        store = create_store()
        upload_documents(store)

    else:
        print(
            "\nExisting File Search Store found."
        )
        print(
            "\nDocuments were NOT uploaded again."
        )
        print(
            "The existing indexed documents "
            "will be reused."
        )
    store_file = BASE_DIR / "file_search_store.txt"
    with open(
        store_file,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(store.name)

    print("\n========================================")
    print("SETUP COMPLETE")
    print("========================================")
    print(f"\nStore name:")
    print(store.name)
    print(f"\nStore name saved to:")
    print(store_file)
    print("\nYou do NOT need to run this for ""every question.")

if __name__ == "__main__":
    main()