import os
import gc
from huggingface_hub import hf_hub_download
from llama_cpp import Llama
from loguru import logger

# Constants for default model
MODELS_DIR = ".data/models"

MODEL_CONFIGS = {
    "rag": {
        "repo_id": "QuantFactory/sarvam-1-GGUF",
        "filename": "sarvam-1-Q4_K_M.gguf",
        "name": "Sarvam-1 2B (RAG Mode)"
    },
    "chat": {
        "repo_id": "bartowski/Qwen2.5-3B-Instruct-GGUF",
        "filename": "Qwen2.5-3B-Instruct-Q4_K_M.gguf",
        "name": "Qwen2.5 3B Instruct (Chat Mode)"
    }
}

class LLMService:
    """Service for interacting with local LLMs via llama-cpp, supporting model hot-swaps."""

    def __init__(self, default_mode: str = "rag"):
        self.llm = None
        self.current_mode = None
        self.compute_backend = "cpu"
        
        os.makedirs(MODELS_DIR, exist_ok=True)
        self.load_model(default_mode)

    def _ensure_model_downloaded(self, repo_id: str, filename: str) -> str:
        """Downloads the model from HuggingFace Hub if it doesn't exist locally."""
        model_path = os.path.join(MODELS_DIR, filename)
        if not os.path.exists(model_path):
            logger.info(f"Downloading model {filename} from {repo_id}...")
            try:
                downloaded_path = hf_hub_download(
                    repo_id=repo_id,
                    filename=filename,
                    local_dir=MODELS_DIR,
                    local_dir_use_symlinks=False
                )
                logger.info(f"Model successfully downloaded to {downloaded_path}")
                return downloaded_path
            except Exception as e:
                logger.error(f"Failed to download model: {e}")
                raise
        else:
            logger.info(f"Using cached model at {model_path}")
            return model_path

    def load_model(self, mode: str):
        """Swaps the current model in VRAM for the requested mode's model."""
        if mode not in MODEL_CONFIGS:
            raise ValueError(f"Unknown model mode: {mode}")
            
        if self.current_mode == mode and self.llm is not None:
            return # Already loaded
            
        config = MODEL_CONFIGS[mode]
        logger.info(f"Switching LLM to mode '{mode}' ({config['name']})")
        
        # 1. Unload existing model to free VRAM
        if self.llm is not None:
            logger.info("Unloading previous model from VRAM...")
            del self.llm
            self.llm = None
            gc.collect()
            
        # 2. Ensure new model exists locally
        model_path = self._ensure_model_downloaded(config["repo_id"], config["filename"])
            
        # 3. Load new model
        logger.info(f"Loading new model: {model_path}")
        
        # Prefer GPU offload when CUDA is available.
        n_gpu = 0
        gpu_offload_supported = False
        try:
            import torch
            import llama_cpp

            cuda_available = torch.cuda.is_available()
            gpu_offload_supported = bool(
                hasattr(llama_cpp, 'llama_supports_gpu_offload') and llama_cpp.llama_supports_gpu_offload()
            )

            if cuda_available and gpu_offload_supported:
                n_gpu = -1
            elif cuda_available and not gpu_offload_supported:
                logger.warning("CUDA detected, but llama-cpp-python was built without GPU offload support.")
        except Exception as e:
            logger.warning(f"GPU detection failed ({e}), defaulting to CPU.")
            
        try:
            self.llm = Llama(
                model_path=model_path,
                n_gpu_layers=n_gpu,
                n_ctx=4096, # Bumped ctx for Llama chat
                verbose=False
            )
            self.current_mode = mode
            self.compute_backend = "gpu" if n_gpu == -1 else "cpu"
            logger.success(f"Successfully loaded {config['name']} on {self.compute_backend.upper()}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def get_current_model_info(self) -> dict:
        """Returns metadata about the active model."""
        if self.current_mode:
            info = dict(MODEL_CONFIGS[self.current_mode])
            info["mode"] = self.current_mode
            info["compute_backend"] = self.compute_backend
            return info
        return {"name": "None", "filename": "None", "mode": "none", "compute_backend": "cpu"}

    def generate_response(self, prompt: str, mode: str = "rag", max_tokens: int = 512, temperature: float = 0.7) -> str:
        """
        Generates a response. Will auto-swap the underlying LLM if the requested mode 
        differs from the currently loaded one.
        """
        # Auto-swap model if necessary
        if mode != self.current_mode:
            self.load_model(mode)
            
        if not self.llm:
            raise RuntimeError("Model is not loaded.")

        logger.debug(f"Generating ({self.current_mode} mode) response for prompt length {len(prompt)}")
        
        try:
            stop_tokens = ["<|im_end|>", "<|endoftext|>", "<|eot_id|>"] # Added Llama 3 stop token
            response = self.llm(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                stop=stop_tokens
            )
            return response['choices'][0]['text'].strip()
        except Exception as e:
            logger.error(f"Error during response generation: {e}")
            raise

# Singleton instance
_instance = None

def get_llm_service() -> LLMService:
    global _instance
    if _instance is None:
        _instance = LLMService()
    return _instance
