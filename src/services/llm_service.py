import os
import requests
from loguru import logger

KOBOLDCPP_BASE_URL = os.getenv("KOBOLDCPP_BASE_URL", "http://127.0.0.1:5001").rstrip("/")
KOBOLDCPP_TIMEOUT_SECONDS = int(os.getenv("KOBOLDCPP_TIMEOUT_SECONDS", "240"))
KOBOLDCPP_CONTEXT_LENGTH = int(os.getenv("KOBOLDCPP_CONTEXT_LENGTH", "4096"))

MODEL_CONFIGS = {
    "rag": {
        "name": os.getenv("KOBOLDCPP_RAG_MODEL_NAME", "Sarvam-1 2B (RAG Mode)")
    },
    "chat": {
        "name": os.getenv("KOBOLDCPP_CHAT_MODEL_NAME", "Qwen2.5 3B Instruct (Chat Mode)")
    }
}

class LLMService:
    """Service for interacting with an external KoboldCpp server via HTTP."""

    def __init__(self, default_mode: str = "rag"):
        self.current_mode = None
        self.compute_backend = "koboldcpp"
        self.connected = False
        self.session = requests.Session()
        self.load_model(default_mode)

    def _ping_server(self) -> bool:
        health_paths = [
            "/api/extra/version",
            "/api/v1/model",
            "/api/v1/config/max_length",
        ]
        for path in health_paths:
            try:
                response = self.session.get(
                    f"{KOBOLDCPP_BASE_URL}{path}", timeout=min(10, KOBOLDCPP_TIMEOUT_SECONDS)
                )
                if response.ok:
                    return True
            except Exception:
                continue
        return False

    def load_model(self, mode: str):
        """Selects logical mode; actual model should be loaded in KoboldCpp server."""
        if mode not in MODEL_CONFIGS:
            raise ValueError(f"Unknown model mode: {mode}")

        config = MODEL_CONFIGS[mode]
        self.current_mode = mode
        self.connected = self._ping_server()
        if self.connected:
            logger.success(f"KoboldCpp reachable at {KOBOLDCPP_BASE_URL} (mode={mode}, model={config['name']})")
        else:
            logger.warning(
                f"KoboldCpp not reachable at {KOBOLDCPP_BASE_URL}. "
                "Start KoboldCpp server before querying /chat or /ask."
            )

    def get_current_model_info(self) -> dict:
        """Returns metadata about the active model."""
        if self.current_mode:
            info = dict(MODEL_CONFIGS[self.current_mode])
            info["mode"] = self.current_mode
            info["compute_backend"] = self.compute_backend
            info["connected"] = self.connected
            return info
        return {"name": "None", "mode": "none", "compute_backend": "koboldcpp", "connected": False}

    def generate_response(self, prompt: str, mode: str = "rag", max_tokens: int = 512, temperature: float = 0.7) -> str:
        """Generate a completion via KoboldCpp /api/v1/generate."""
        if mode != self.current_mode:
            self.load_model(mode)

        if not self.connected and not self._ping_server():
            raise RuntimeError(
                f"KoboldCpp server is not reachable at {KOBOLDCPP_BASE_URL}. "
                "Launch KoboldCpp with your GPU-enabled settings and try again."
            )
        self.connected = True

        try:
            payload = {
                "prompt": prompt,
                "max_context_length": KOBOLDCPP_CONTEXT_LENGTH,
                "max_length": max_tokens,
                "temperature": temperature,
                "top_p": 0.92,
                "top_k": 40,
                "rep_pen": 1.1,
                "stop_sequence": ["<|im_end|>", "<|endoftext|>", "<|eot_id|>"],
            }
            response = self.session.post(
                f"{KOBOLDCPP_BASE_URL}/api/v1/generate",
                json=payload,
                timeout=KOBOLDCPP_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()

            if isinstance(data, dict):
                if "results" in data and data["results"]:
                    return (data["results"][0].get("text") or "").strip()
                if "choices" in data and data["choices"]:
                    return (data["choices"][0].get("text") or "").strip()

            raise RuntimeError(f"Unexpected KoboldCpp response format: {str(data)[:400]}")
        except Exception as e:
            logger.error(f"Error during KoboldCpp generation: {e}")
            raise

# Singleton instance
_instance = None

def get_llm_service() -> LLMService:
    global _instance
    if _instance is None:
        _instance = LLMService()
    return _instance
