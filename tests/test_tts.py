import pytest
import os
from src.services.tts_service import get_tts_service

def test_tts_service_singleton():
    s1 = get_tts_service()
    s2 = get_tts_service()
    assert s1 is s2
    assert s1.pipeline is not None

def test_generate_audio():
    service = get_tts_service()
    text = "Hello world, this is a test of the text to speech engine."
    
    # We use a custom test output file to avoid overwriting production temp files
    output_filename = "test_output.wav"
    output_path = service.generate_audio(text, output_filename=output_filename)
    
    assert os.path.exists(output_path)
    assert output_path.endswith(output_filename)
    
    # Cleanup
    if os.path.exists(output_path):
        os.remove(output_path)
