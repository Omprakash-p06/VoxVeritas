from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import os
import uuid
import glob
from loguru import logger
from datetime import datetime, timezone

from src.services.document_parser import DocumentParser
from src.services import vector_store

router = APIRouter()

UPLOAD_DIR = ".data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Response models ───────────────────────────────────────────

class DocumentInfo(BaseModel):
    doc_id: str
    filename: str
    chunks: int
    uploaded_at: str
    detected_languages: List[str]

class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int

class IngestionResponse(BaseModel):
    doc_id: str
    filename: str
    chunks: int
    detected_languages: List[str]
    status: str

class DeleteResponse(BaseModel):
    success: bool
    doc_id: str
    chunks_removed: int

# ── Endpoints ─────────────────────────────────────────────────

@router.get("/documents", response_model=DocumentListResponse, summary="List all uploaded documents")
async def list_documents() -> DocumentListResponse:
    """Returns metadata for every document stored in the vector store."""
    try:
        collection = vector_store.get_collection()
        all_data = collection.get(include=["metadatas"])
        metadatas = all_data.get("metadatas") or []

        # Group by doc_id
        docs: dict[str, DocumentInfo] = {}
        for m in metadatas:
            if not m:
                continue
            doc_id = m.get("doc_id", "unknown")
            if doc_id not in docs:
                # Try to get upload time from filesystem
                uploaded_at = ""
                try:
                    pattern = os.path.join(UPLOAD_DIR, f"{doc_id}_*")
                    matches = glob.glob(pattern)
                    if matches:
                        uploaded_at = datetime.fromtimestamp(
                            os.path.getmtime(matches[0]), tz=timezone.utc
                        ).isoformat()
                except Exception:
                    pass

                docs[doc_id] = DocumentInfo(
                    doc_id=doc_id,
                    filename=m.get("source_filename", m.get("filename", "unknown")),
                    chunks=0,
                    uploaded_at=uploaded_at or datetime.now(timezone.utc).isoformat(),
                    detected_languages=["en"],
                )
            docs[doc_id].chunks += 1

        doc_list = list(docs.values())
        return DocumentListResponse(documents=doc_list, total=len(doc_list))
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/document/{doc_id}", response_model=DeleteResponse, summary="Delete a document and its chunks")
async def delete_document(doc_id: str) -> DeleteResponse:
    """Deletes all chunks for a given document from the vector store and removes the upload."""
    try:
        collection = vector_store.get_collection()

        # Find all chunk IDs for this doc_id
        all_data = collection.get(include=["metadatas"])
        ids_to_delete = []
        for id_, meta in zip(all_data["ids"], all_data.get("metadatas") or []):
            if meta and meta.get("doc_id") == doc_id:
                ids_to_delete.append(id_)

        if not ids_to_delete:
            raise HTTPException(status_code=404, detail=f"Document {doc_id} not found")

        collection.delete(ids=ids_to_delete)

        # Remove uploaded file from disk
        pattern = os.path.join(UPLOAD_DIR, f"{doc_id}_*")
        for fpath in glob.glob(pattern):
            try:
                os.remove(fpath)
            except Exception:
                pass

        logger.info(f"Deleted document {doc_id}: {len(ids_to_delete)} chunks removed")
        return DeleteResponse(success=True, doc_id=doc_id, chunks_removed=len(ids_to_delete))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document {doc_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=IngestionResponse, summary="Upload a document for indexing")
async def upload_document(file: UploadFile = File(...)) -> IngestionResponse:
    """
    Accepts a PDF, DOCX, or TXT file, extracts its text, chunks it, and adds the embeddings to ChromaDB.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".txt", ".pdf", ".docx", ".md"]:
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
            chunks=len(chunks),
            detected_languages=["en"],
            status="completed",
        )
    except Exception as e:
        logger.error(f"Error processing document {doc_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
