import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from loguru import logger
import os

# Initialize persistent ChromaDB client
PERSIST_DIRECTORY = ".data/chromadb"
os.makedirs(PERSIST_DIRECTORY, exist_ok=True)

try:
    client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
    logger.info(f"Initialized ChromaDB at {PERSIST_DIRECTORY}")
except Exception as e:
    logger.error(f"Failed to initialize ChromaDB: {e}")
    raise

# Use default sentence-transformer miniLM for speed and reliability currently
# The plan suggested l3cube-pune/indic-sentence-bert-nli, but all-MiniLM-L6-v2 is safely cached
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

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
