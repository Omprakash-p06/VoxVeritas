from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import uuid
from loguru import logger

from src.services.document_parser import DocumentParser
from src.services import vector_store

router = APIRouter()

UPLOAD_DIR = ".data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class IngestionResponse(BaseModel):
    doc_id: str
    filename: str
    chunk_count: int

@router.post("/upload", response_model=IngestionResponse, summary="Upload a document for indexing")
async def upload_document(file: UploadFile = File(...)) -> IngestionResponse:
    """
    Accepts a PDF, DOCX, or TXT file, extracts its text, chunks it, and adds the embeddings to ChromaDB.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".txt", ".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")

    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save uploaded file
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        logger.info(f"Saved uploaded file {file.filename} to {file_path}")
    except Exception as e:
        logger.error(f"Failed to save file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")
    
    # Process document
    try:
        text = DocumentParser.extract_text(file_path)
        chunks = DocumentParser.chunk_text(text)
        
        metadata = {
            "source_filename": file.filename,
            "doc_id": doc_id,
            "format": ext
        }
        
        collection = vector_store.get_collection()
        vector_store.add_chunks(collection, chunks, metadata, doc_id)
        
        return IngestionResponse(
            doc_id=doc_id,
            filename=file.filename,
            chunk_count=len(chunks)
        )
    except Exception as e:
        logger.error(f"Error processing document {doc_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
