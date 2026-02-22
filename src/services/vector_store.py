import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from loguru import logger
import os

try:
    import torch
except Exception:
    torch = None

# Initialize persistent ChromaDB client
PERSIST_DIRECTORY = ".data/chromadb"
os.makedirs(PERSIST_DIRECTORY, exist_ok=True)

try:
    client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
    logger.info(f"Initialized ChromaDB at {PERSIST_DIRECTORY}")
except Exception as e:
    logger.error(f"Failed to initialize ChromaDB: {e}")
    raise

# Use default sentence-transformer miniLM for speed and reliability.
# Prefer CUDA when available, otherwise fall back to CPU.
_embedding_device = "cpu"
if torch is not None:
    try:
        _embedding_device = "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        _embedding_device = "cpu"

sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2",
    device=_embedding_device
)

def get_collection() -> chromadb.Collection:
    """Gets or creates the main document collection."""
    return client.get_or_create_collection(
        name="voxveritas_docs",
        embedding_function=sentence_transformer_ef
    )

def add_chunks(collection: chromadb.Collection, chunks: list[str], metadata: dict, doc_id: str) -> None:
    """
    Computes embeddings for the chunks and adds them to the ChromaDB collection.
    
    Args:
        collection: The ChromaDB collection instance.
        chunks: List of text chunks to add.
        metadata: Base metadata dictionary to attach to each chunk.
        doc_id: Unique identifier for the document.
    """
    if not chunks:
        logger.warning(f"No chunks to add for document {doc_id}")
        return

    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = []
    
    for i in range(len(chunks)):
        chunk_meta = metadata.copy()
        chunk_meta["chunk_index"] = i
        metadatas.append(chunk_meta)

    try:
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"Successfully added {len(chunks)} chunks for {doc_id} to collection.")
    except Exception as e:
        logger.error(f"Failed to add chunks for {doc_id} to collection: {e}")
        raise

def query_collection(
    collection: chromadb.Collection,
    query: str,
    n_results: int = 4,
    max_distance: float = 2.2,
    where: dict | None = None,
) -> list[dict]:
    """
    Queries the collection for the most relevant documents.
    Filters out results that have an L2 distance greater than max_distance.
    
    Returns:
        List of dictionaries containing 'text' and 'metadata'.
    """
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where,
        )
        
        formatted_results = []
        if not results['documents']:
            return []
            
        for i in range(len(results['documents'][0])):
            # Filter by matching distance
            if 'distances' in results and results['distances']:
                distance = results['distances'][0][i]
                if distance > max_distance:
                    logger.debug(f"Filtering out context chunk due to high distance: {distance:.3f} > {max_distance}")
                    continue
                    
            formatted_results.append({
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i] or {}
            })

        # If strict distance filtering removed everything, fall back to top-k so RAG still has context.
        if not formatted_results and results.get('documents') and results['documents'][0]:
            logger.warning("All chunks filtered by distance; falling back to top retrieval results.")
            for i in range(min(2, len(results['documents'][0]))):
                formatted_results.append({
                    "text": results['documents'][0][i],
                    "metadata": (results.get('metadatas') or [[{}]])[0][i] or {}
                })
            
        return formatted_results
    except Exception as e:
        logger.error(f"Failed to query collection: {e}")
        raise
