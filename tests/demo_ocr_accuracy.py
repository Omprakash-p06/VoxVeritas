import os
from src.services.screen_reader import get_screen_reader_service

def test_ocr_accuracy():
    print("==================================================")
    print("  VOXVERITAS: SCREEN READER ACCURACY TEST")
    print("==================================================")
    print("Capturing your current screen...")
    
    service = get_screen_reader_service()
    extracted_text = service.capture_and_read_screen()
    
    if not extracted_text:
        print("❌ No text was found on the screen, or an error occurred.")
        return
        
    print(f"\n✅ Screen captured successfully. Extracted {len(extracted_text)} characters.\n")
    print("--- EXTRACTED TEXT ---")
    print(extracted_text)
    print("----------------------\n")
    
    # Save to a file so it's easy to read
    output_file = "ocr_accuracy_results.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(extracted_text)
        
    print(f"I have also saved this output to {os.path.abspath(output_file)} so you can review it easily.")

if __name__ == "__main__":
    test_ocr_accuracy()
