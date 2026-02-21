import os
import asyncio
from loguru import logger
from PIL import ImageGrab

# We use winsdk to access Windows 10/11 native OCR API for zero VRAM overhead
import winsdk.windows.media.ocr as ocr
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.storage as storage
import winsdk.windows.storage.streams as streams

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
        # We can dynamically retrieve the active language or default to the profile
        logger.info("Initializing Windows Native OCR Engine (winsdk)...")
        self.engine = ocr.OcrEngine.try_create_from_user_profile_languages()
        
        if self.engine is None:
            logger.error("Failed to initialize Windows OCR Engine. Ensure Windows language packs are installed.")
            raise RuntimeError("Windows Native OCR initialization failed.")
        
        logger.info("Windows OCR Engine connected successfully")

    async def _extract_text_async(self, file_path: str) -> str:
        """
        Asynchronously loads an image file via WinRT StorageFile and runs OcrEngine on it.
        """
        try:
            # 1. Get WinRT StorageFile wrapper
            # Path must be absolute for WinRT
            abs_path = os.path.abspath(file_path)
            file = await storage.StorageFile.get_file_from_path_async(abs_path)
            
            # 2. Open file stream
            stream = await file.open_async(storage.FileAccessMode.READ)
            
            # 3. Create BitmapDecoder to extract a SoftwareBitmap
            decoder = await imaging.BitmapDecoder.create_async(stream)
            software_bitmap = await decoder.get_software_bitmap_async()
            
            # 4. Run the OCR engine
            ocr_result = await self.engine.recognize_async(software_bitmap)
            
            # 5. Compile text
            if ocr_result and ocr_result.text:
                return ocr_result.text
            else:
                return ""
        except Exception as e:
            logger.error(f"Error during Windows OCR extraction: {str(e)}")
            return ""

    def capture_and_read_screen(self) -> str:
        """
        Synchronous wrapper: Grabs the current screen using Pillow, saves a temporary PNG, 
        and extracts all visible text using the native Windows OCR engine.
        Returns a single unified string of the screen contents.
        """
        temp_path = os.path.join(TEMP_IMAGE_DIR, "screen_capture.png")
        
        try:
            logger.debug("Capturing full screen via Pillow ImageGrab...")
            screenshot = ImageGrab.grab()
            screenshot.save(temp_path, format="PNG")
            
            logger.debug(f"Image saved to {temp_path}, running Native OCR...")
            
            # Run the async OCR method in the current event loop (or create one)
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
            text = loop.run_until_complete(self._extract_text_async(temp_path))
            
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
