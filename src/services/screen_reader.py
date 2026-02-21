import os
import sys
import asyncio
from loguru import logger
from PIL import ImageGrab

# Conditional imports based on OS platform
PLATFORM = sys.platform

if PLATFORM == "win32":
    # WinRT dependencies for zero-VRAM Windows OCR
    try:
        import winsdk.windows.media.ocr as ocr
        import winsdk.windows.graphics.imaging as imaging
        import winsdk.windows.storage as storage
        import winsdk.windows.storage.streams as streams
    except ImportError:
        logger.warning("Failed to load winsdk on win32. Windows native OCR will be unavailable.")
elif PLATFORM.startswith("linux"):
    # Tesseract dependency for zero-VRAM Linux OCR
    try:
        import pytesseract
    except ImportError:
        logger.warning("Failed to load pytesseract on Linux. Linux OCR will be unavailable.")

TEMP_IMAGE_DIR = ".data/temp_image"
os.makedirs(TEMP_IMAGE_DIR, exist_ok=True)

class ScreenReaderService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ScreenReaderService, cls).__new__(cls)
            cls._instance._init_service()
        return cls._instance

    def _init_service(self):
        self.engine = None
        self.is_linux = PLATFORM.startswith("linux")
        self.is_windows = PLATFORM == "win32"
        
        if self.is_windows:
            logger.info("Initializing Windows Native OCR Engine (winsdk)...")
            try:
                self.engine = ocr.OcrEngine.try_create_from_user_profile_languages()
                if self.engine:
                    logger.info("Windows OCR Engine connected successfully")
                else:
                    logger.error("Failed to initialize Windows OCR Engine. Ensure Windows language packs are installed.")
            except Exception as e:
                logger.error(f"WinRT initialization error: {e}")
                
        elif self.is_linux:
            logger.info("Initializing Linux Tesseract OCR Fallback...")
            # We don't need a formal "engine" object for pytesseract, 
            # but we set flag to true so we know it's available.
            # You must have tesseract installed on the system (e.g. pacman -S tesseract)
            self.engine = "tesseract"
        else:
            logger.error(f"Unsupported OS platform for Screen OCR: {PLATFORM}")

    async def _extract_text_windows_async(self, file_path: str) -> str:
        """
        Asynchronously loads an image file via WinRT StorageFile and runs OcrEngine on it.
        """
        if not self.engine:
            return ""
            
        try:
            abs_path = os.path.abspath(file_path)
            file = await storage.StorageFile.get_file_from_path_async(abs_path)
            stream = await file.open_async(storage.FileAccessMode.READ)
            decoder = await imaging.BitmapDecoder.create_async(stream)
            software_bitmap = await decoder.get_software_bitmap_async()
            ocr_result = await self.engine.recognize_async(software_bitmap)
            
            if ocr_result and ocr_result.text:
                return ocr_result.text
            return ""
        except Exception as e:
            logger.error(f"Error during Windows OCR extraction: {str(e)}")
            return ""

    def _extract_text_linux(self, file_path: str) -> str:
        """
        Runs Tesseract OCR on the saved image path for Linux systems.
        """
        try:
            import pytesseract
            # For pytesseract, we just pass the file path or PIL image
            text = pytesseract.image_to_string(file_path)
            return text.strip()
        except Exception as e:
            logger.error(f"Error during Linux Tesseract OCR extraction: {str(e)}. Ensure 'tesseract' is installed natively (e.g. pacman -S tesseract).")
            return ""

    def capture_and_read_screen(self) -> str:
        """
        Synchronous wrapper: Grabs the current screen using Pillow, saves a temporary PNG, 
        and extracts all visible text using the native OS OCR engine.
        """
        if not self.engine:
            logger.error("Screen reader engine not initialized. Cannot capture screen.")
            return ""
            
        temp_path = os.path.join(TEMP_IMAGE_DIR, "screen_capture.png")
        
        try:
            logger.debug(f"Capturing full screen via Pillow ImageGrab on {PLATFORM}...")
            
            # On Wayland (modern Linux), ImageGrab might fail unless gnome-screenshot or grim is installed
            # but Pillow 9.3+ supports wayland via wl-paste/grim natively if available.
            screenshot = ImageGrab.grab()
            screenshot.save(temp_path, format="PNG")
            
            logger.debug(f"Image saved to {temp_path}, running OCR...")
            
            if self.is_windows:
                try:
                    loop = asyncio.get_event_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                text = loop.run_until_complete(self._extract_text_windows_async(temp_path))
            elif self.is_linux:
                text = self._extract_text_linux(temp_path)
            else:
                text = ""
            
            logger.info(f"Screen OCR complete. Extracted {len(text)} characters.")
            return text.strip()
            
        except Exception as e:
            logger.error(f"ScreenReaderService failed to read screen: {str(e)}")
            return ""
        finally:
            # Cleanup temp image
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass

def get_screen_reader_service() -> ScreenReaderService:
    return ScreenReaderService()
