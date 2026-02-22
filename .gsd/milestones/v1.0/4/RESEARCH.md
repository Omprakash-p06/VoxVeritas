# Phase 4 Research: Screen Reading & Accessibility Expansion

## Objective
Implement a mechanism to capture the user's current screen and extract text from it reliably and efficiently, without blowing out the 4GB GPU VRAM budget already occupied by the LLM.

## 1. Screen Capture
**Options Reviewed**:
- `pyautogui` / `Pillow.ImageGrab`: Both are lightweight, well-tested Python libraries capable of taking full-screen or regional screenshots natively on Windows. `Pillow` is already heavily used in the Python ecosystem and `ImageGrab` works out of the box.

## 2. Optical Character Recognition (OCR)
**Options Reviewed**:
1. **Tesseract (`pytesseract`)**: 
   - *Pros*: Excellent accuracy, open-source.
   - *Cons*: Requires downloading and installing a separate Google Tesseract Windows installer (`.exe`) and adding it to the System PATH. Breaks the "pip install and go" Python experience.
2. **EasyOCR / Surya OCR**:
   - *Pros*: Pip installable, very high accuracy, PyTorch native.
   - *Cons*: Incredibly heavy. Loads massive vision models into GPU VRAM. Given we are strictly confined to 4GB VRAM and already running an LLM, loading an EasyOCR model alongside Sarvam will guarantee an Out-Of-Memory (OOM) crash.
3. **Windows Native OCR (`winsdk` / WinRT API)**:
   - *Pros*: Windows 10/11 ships with an incredibly fast, highly accurate, built-in OCR engine (`Windows.Media.Ocr`). It uses 0 extra VRAM, relies entirely on OS-level C++ optimizations, and requires no external downloads assuming the system language packs are active. It can be accessed in Python via the `winsdk` pip package.
   - *Cons*: Strictly locked to Windows environments (which matches the user's constraints).

## Verdict & Action Plan
We will use **Pillow (`ImageGrab`)** to capture the screen into memory and pass it to **Windows Native OCR via `winsdk`**. This guarantees maximum speed and zero additional GPU memory overhead, adhering strictly to the strict hardware limitations of this project.

1. Install `winsdk` and `Pillow`.
2. Create `ScreenReaderService` to handle `ImageGrab` and WinRT data passing.
3. Integrate the OCR context into the `/ask_voice` RAG pipeline so the LLM can "see" what's on the user's screen when answering questions.
