import os
import whisper
from loguru import logger
import torch

class STTService:
    _instance = None
    
    def __new__(cls, model_size="base"):
        if cls._instance is None:
            cls._instance = super(STTService, cls).__new__(cls)
            cls._instance._init_service(model_size)
        return cls._instance

    def _init_service(self, model_size):
        self.model_size = model_size
        self.model = None
        self._load_model()

    def _load_model(self):
        logger.info(f"Loading Whisper model '{self.model_size}'...")
        
        # Check if GPU is available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.debug(f"Whisper device selected: {device}")
        
        try:
            # Setting in_memory=True if running on small models to reduce disk io, 
            # whisper base model is ~74M parameters, perfectly fits in 4GB VRAM
            self.model = whisper.load_model(self.model_size, device=device)
            logger.info("Whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {str(e)}")
            raise

    def transcribe_audio(self, file_path: str, language: str = None) -> str:
        """
        Transcribes the audio file to text.
        If language is provided, it forces transcription in that language.
        If not, the model auto-detects.
        """
        if not self.model:
            raise RuntimeError("Whisper model is not loaded.")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        logger.debug(f"Transcribing {file_path}")
        
        try:
            # We use half precision strictly on GPU
            fp16 = torch.cuda.is_available()
            
            # Additional args like language can go here
            options = {"fp16": fp16}
            if language:
                options["language"] = language
                
            result = self.model.transcribe(file_path, **options)
            transcription = result.get("text", "").strip()
            
            detected_lang = result.get("language", "unknown")
            logger.debug(f"Transcription complete. Detected language: {detected_lang}")
            
            return transcription
        except Exception as e:
            logger.error(f"Error during transcription: {str(e)}")
            raise

def get_stt_service() -> STTService:
    return STTService()
