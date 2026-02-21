import pytest
import wave
import os
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

@pytest.fixture
def mock_audio_fixture(tmp_path):
    file_path = tmp_path / "fixture.wav"
    with wave.open(str(file_path), 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        wav_file.writeframes(b'\x00\x00' * 16000)
    return str(file_path)

def test_transcribe_endpoint(mock_audio_fixture):
    with open(mock_audio_fixture, "rb") as audio:
        response = client.post(
            "/transcribe",
            files={"file": ("fixture.wav", audio, "audio/wav")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "transcription" in data

def test_synthesize_endpoint():
    response = client.post(
        "/synthesize",
        json={"text": "Hello world, this is a test"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"
    assert len(response.content) > 0 # make sure file is not empty

def test_ask_voice_endpoint(mock_audio_fixture):
    # This invokes all three models (STT -> RAG -> TTS), so it might take 10-20s.
    with open(mock_audio_fixture, "rb") as audio:
        response = client.post(
            "/ask_voice",
            files={"file": ("fixture.wav", audio, "audio/wav")}
        )
        
    assert response.status_code == 200
    data = response.json()
    assert "transcription" in data
    assert "answer" in data
    assert "audio_base64" in data
    assert len(data["audio_base64"]) > 0

def test_ask_voice_endpoint_with_screen(mock_audio_fixture):
    with open(mock_audio_fixture, "rb") as audio:
        response = client.post(
            "/ask_voice",
            files={"file": ("fixture.wav", audio, "audio/wav")},
            data={"read_screen": True}
        )
        
    assert response.status_code == 200
    data = response.json()
    assert "transcription" in data
    assert "answer" in data
    
    # Due to dynamic screen content we can't assert the exact contents of the answer
    # but we can assert the pipeline ran without exploding the context window or throwing a 500
    assert response.status_code == 200
