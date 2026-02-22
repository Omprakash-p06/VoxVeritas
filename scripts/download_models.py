import os
from huggingface_hub import hf_hub_download
from loguru import logger

MODELS_DIR = ".data/models"

MODELS_TO_DOWNLOAD = [
    {
        "repo_id": "QuantFactory/sarvam-1-GGUF",
        "filename": "sarvam-1-Q4_K_M.gguf",
        "description": "Sarvam-1 2B (RAG & Multilingual)"
    },
    {
        "repo_id": "bartowski/Llama-3.2-3B-Instruct-GGUF",
        "filename": "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
        "description": "Llama 3.2 3B (Normal Chatbot)"
    }
]

def download_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    logger.info(f"Starting model downloads to {MODELS_DIR}")
    
    for model in MODELS_TO_DOWNLOAD:
        local_path = os.path.join(MODELS_DIR, model["filename"])
        if os.path.exists(local_path):
            logger.info(f"[{model['description']}] Already exists at {local_path}. Skipping.")
            continue
            
        logger.info(f"[{model['description']}] Downloading {model['filename']} from {model['repo_id']}...")
        try:
            downloaded_path = hf_hub_download(
                repo_id=model["repo_id"],
                filename=model["filename"],
                local_dir=MODELS_DIR,
                local_dir_use_symlinks=False
            )
            logger.success(f"[{model['description']}] Downloaded successfully to {downloaded_path}")
        except Exception as e:
            logger.error(f"[{model['description']}] Failed to download: {e}")

    logger.info("Note: Whisper and Kokoro models are downloaded automatically by their respective libraries during first use.")

if __name__ == "__main__":
    download_models()
