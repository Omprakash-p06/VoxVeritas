import os
import sys
import base64
import wave
import tempfile
import requests

try:
    import simpleaudio as sa
    HAS_AUDIO_PLAYBACK = True
except ImportError:
    HAS_AUDIO_PLAYBACK = False
    print("[Warning] 'simpleaudio' not installed. Auto-playback will be disabled.")
    print("To enable playback: pip install simpleaudio")

import argparse

def create_mock_question_audio(text="What is the capital of France?", output_path="question.wav"):
    """
    Since we don't have a reliable easy mic recording built-in here without external deps, 
    we will rely on a pre-existing WAV file or we just use TTS to generate our question file first 
    if we wanted to. We'll assume the user provides an audio file.
    """
    pass

def test_pipeline(audio_file_path: str, url: str):
    print(f"🎙️ Using Audio File: {audio_file_path}")
    print(f"🌐 Sending POST request to {url}/ask_voice ...")
    
    if not os.path.exists(audio_file_path):
        print(f"❌ Error: File {audio_file_path} not found.")
        return

    with open(audio_file_path, "rb") as f:
        response = requests.post(
            f"{url}/ask_voice",
            files={"file": (os.path.basename(audio_file_path), f, "audio/wav")}
        )

    if response.status_code == 200:
        data = response.json()
        print("\n" + "="*50)
        print("✅ PIPELINE SUCCESS")
        print("="*50)
        print(f"🗣️ Transcription: \n{data.get('transcription')}\n")
        print(f"🤖 Answer: \n{data.get('answer')}\n")
        print(f"📚 Citations: \n{', '.join(data.get('citations', []))}\n")
        
        # Handle Audio Base64
        audio_b64 = data.get("audio_base64")
        if audio_b64:
            audio_bytes = base64.b64decode(audio_b64)
            # Save it temporarily
            temp_output = os.path.join(tempfile.gettempdir(), "voxveritas_demo_answer.wav")
            with open(temp_output, "wb") as out_f:
                out_f.write(audio_bytes)
            
            print(f"🔊 Audio saved temporarily to {temp_output}")
            
            if HAS_AUDIO_PLAYBACK:
                print("▶️ Playing audio...")
                wave_obj = sa.WaveObject.from_wave_file(temp_output)
                play_obj = wave_obj.play()
                play_obj.wait_done()
    else:
        print(f"❌ Error: Server returned {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VoxVeritas Voice-to-Voice End-to-End Tester")
    parser.add_argument("--file", required=True, help="Path to the input WAV file containing speech.")
    parser.add_argument("--url", default="http://127.0.0.1:8000", help="FastAPI Server URL")
    
    args = parser.parse_args()
    test_pipeline(args.file, args.url)
