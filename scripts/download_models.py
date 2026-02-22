import argparse
import sys
import urllib.request
from pathlib import Path

MODEL_DIR = Path('.data/models')
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODELS = {
    'qwen': {
        'filename': 'Qwen2.5-3B-Instruct-Q4_K_M.gguf',
        'url': 'https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf',
    },
    'sarvam': {
        'filename': 'sarvam-1-Q4_K_M.gguf',
        'url': 'https://huggingface.co/QuantFactory/sarvam-1-GGUF/resolve/main/sarvam-1-Q4_K_M.gguf',
    },
    'llama': {
        'filename': 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
        'url': 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    },
}


def download_file(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    print(f'Downloading: {destination.name}')
    urllib.request.urlretrieve(url, str(destination))
    size_mb = destination.stat().st_size / (1024 * 1024)
    print(f'  done ({size_mb:.1f} MB)')


def ensure_model(model_key: str) -> None:
    model = MODELS[model_key]
    out_path = MODEL_DIR / model['filename']

    if out_path.exists() and out_path.stat().st_size > 0:
        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f'Skipping {out_path.name} (already exists, {size_mb:.1f} MB)')
        return

    download_file(model['url'], out_path)


def main() -> int:
    parser = argparse.ArgumentParser(description='Download VoxVeritas GGUF models into .data/models')
    parser.add_argument(
        '--model',
        choices=['all', 'qwen', 'sarvam', 'llama'],
        default='all',
        help='Which model(s) to download',
    )
    args = parser.parse_args()

    targets = list(MODELS.keys()) if args.model == 'all' else [args.model]

    try:
        for key in targets:
            ensure_model(key)
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1

    print('All requested models are present in .data/models')
    print('Whisper and Kokoro assets will download automatically on first use.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
