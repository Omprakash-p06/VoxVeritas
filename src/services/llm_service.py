import os
from huggingface_hub import hf_hub_download
from llama_cpp import Llama
from loguru import logger

# Constants for default model
# Using Qwen2.5-1.5B-Instruct-GGUF as it is high quality and very compact
DEFAULT_REPO_ID = "bartowski/sarvam-1-GGUF"
DEFAULT_FILENAME = "sarvam-1-Q4_K_M.gguf"
MODELS_DIR = ".data/models"

class LLMService:
    """Service for interacting with a local GGUF language model via llama-cpp-python."""

    def __init__(self, repo_id: str = DEFAULT_REPO_ID, filename: str = DEFAULT_FILENAME):
        self.repo_id = repo_id
        self.filename = filename
        self.model_path = os.path.join(MODELS_DIR, filename)
        self.llm = None
        
        os.makedirs(MODELS_DIR, exist_ok=True)
        self._ensure_model_downloaded()
        self._load_model()

    def _ensure_model_downloaded(self):
        """Downloads the model from HuggingFace Hub if it doesn't exist locally."""
        if not os.path.exists(self.model_path):
            logger.info(f"Downloading model {self.filename} from {self.repo_id}...")
            try:
                downloaded_path = hf_hub_download(
                    repo_id=self.repo_id,
                    filename=self.filename,
                    local_dir=MODELS_DIR,
                    local_dir_use_symlinks=False
                )
                self.model_path = downloaded_path
                logger.info(f"Model successfully downloaded to {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to download model: {e}")
                raise
        else:
            logger.info(f"Using cached model at {self.model_path}")

    def _load_model(self):
        """Loads the GGUF model into memory/VRAM using llama-cpp."""
        logger.info(f"Loading model: {self.model_path}")
        
        # Determine GPU layer count based on available backends
        n_gpu = 0
        try:
            import llama_cpp
            # Check if CUDA backend is available in llama-cpp-python
            if hasattr(llama_cpp, 'llama_supports_gpu_offload') and llama_cpp.llama_supports_gpu_offload():
                n_gpu = -1  # Offload all layers
                logger.info("llama-cpp CUDA backend detected — offloading ALL layers to GPU.")
            else:
                # Also try checking via torch
                import torch
                if torch.cuda.is_available():
                    logger.warning("PyTorch has CUDA but llama-cpp-python was NOT compiled with GPU support.")
                    logger.warning("Running LLM on CPU. To enable GPU, install llama-cpp-python with CUDA wheels.")
                else:
                    logger.info("No GPU backend available — running LLM on CPU.")
        except Exception as e:
            logger.warning(f"GPU detection failed ({e}), defaulting to CPU.")
        
        try:
            self.llm = Llama(
                model_path=self.model_path,
                n_gpu_layers=n_gpu,
                n_ctx=2048,
                verbose=False
            )
            device_label = "GPU (all layers)" if n_gpu == -1 else "CPU"
            logger.info(f"Model loaded successfully on {device_label}.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def generate_response(self, prompt: str, max_tokens: int = 512, temperature: float = 0.7) -> str:
        """
        Generates a response from the LLM based on the given prompt.
        """
        if not self.llm:
            raise RuntimeError("Model is not loaded.")

        logger.debug(f"Generating response for prompt length {len(prompt)}")
        
        try:
            # Simple wrapper for chat completion style if desired, 
            # but for now using basic __call__
            response = self.llm(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                stop=["<|im_end|>", "<|endoftext|>"]
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
