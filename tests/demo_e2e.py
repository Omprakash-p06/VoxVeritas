import os
import io
from fastapi.testclient import TestClient
from src.main import app
from src.services.tts_service import get_tts_service

def run_demo():
    print("==================================================")
    print("  VOXVERITAS PHASE 3: END-TO-END PIPELINE TEST")
    print("==================================================")
    
    # 1. Generate a real audio file for the question using Kokoro TTS
    print("\n[1/3] Synthesizing a spoken question audio file (simulating microphone input)...")
    tts_service = get_tts_service()
    question_text = "What is a large language model?"
    print(f"      Question: '{question_text}'")
    
    question_audio_path = tts_service.generate_audio(
        text=question_text, 
        output_filename="test_spoken_query.wav"
    )
    print(f"      Created mock audio input at: {question_audio_path}")

    # 2. Feed it into the new Voice RAG pipeline
    print("\n[2/3] Submitting audio to /ask_voice endpoint (Whisper STT -> ChromaDB -> Sarvam LLM -> Kokoro TTS)...")
    client = TestClient(app)
    
    with open(question_audio_path, "rb") as f:
        # Note: Depending on hardware, loading 3 ML models sequentially may take 15-30 seconds
        response = client.post(
            "/ask_voice",
            files={"file": ("test_spoken_query.wav", f, "audio/wav")}
        )
        
    # 3. Print the results
    print("\n[3/3] Analyzing Pipeline Output...")
    if response.status_code == 200:
        data = response.json()
        print("\n" + "="*50)
        print("✅ PIPELINE EXECUTION SUCCESSFUL")
        print("="*50)
        print(f"🗣️ Whisper Transcription: \n\"{data.get('transcription')}\"\n")
        print(f"🤖 Sarvam-1 RAG Answer: \n{data.get('answer')}\n")
        print(f"📚 ChromaDB Citations: \n{', '.join(data.get('citations', []))}\n")
        
        audio_b64 = data.get("audio_base64", "")
        print(f"🔊 Output Audio (Kokoro TTS): Successfully generated {len(audio_b64)} bytes of Base64 audio payload.")
        print("==================================================")
    else:
        print(f"❌ PIPELINE ERROR: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    run_demo()
