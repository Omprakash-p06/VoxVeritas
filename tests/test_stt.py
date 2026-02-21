import pytest
import os
import wave
from src.services.stt_service import get_stt_service

@pytest.fixture
def mock_audio_file(tmp_path):
    # Create a tiny, valid silent WAV file for testing loading 
    # so we don't have to keep a large dummy file around just to test IO
    file_path = tmp_path / "test.wav"
    with wave.open(str(file_path), 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        wav_file.writeframes(b'\x00\x00' * 16000) # 1 second of silence
    return str(file_path)

def test_stt_service_singleton():
    s1 = get_stt_service()
    s2 = get_stt_service()
    assert s1 is s2
    assert s1.model is not None

def test_transcribe_audio(mock_audio_file):
    # Note: Since the test audio is silent, we just expect it to not crash
    # and return an empty string or a 'silent' warning string
    service = get_stt_service()
    try:
        response = service.transcribe_audio(mock_audio_file)
        assert isinstance(response, str)
    except Exception as e:
        pytest.fail(f"transcribe_audio raised an exception: {e}")
