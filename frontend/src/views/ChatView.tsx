import { useState, useCallback, useEffect, useRef } from 'react';
import { PixelSend, PixelFolder, PixelUpload } from '@/components/ui-custom/PixelIcons';
import { queryText, queryVoice, chatDirect, synthesizeText } from '@/api/query';
import { useAppStore } from '@/store/AppContext';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { ChatBubble } from '@/components/ui-custom/ChatBubble';
import { MicButton } from '@/components/ui-custom/MicButton';
import type { ChatMessage } from '@/types';

// Simple ID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ChatView() {
  const { chatHistory, addMessage, documents } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<string[]>([]);

  // Mode toggles
  const [useRAG, setUseRAG] = useState(true);           // RAG vs Direct LLM
  const [readScreen, setReadScreen] = useState(false);   // Screen reader for voice
  const [ttsEnabled, setTtsEnabled] = useState(false);   // Auto-TTS on responses

  const { state: recordingState, startRecording, stopRecording } = useAudioRecorder();
  const { containerRef, handleScroll } = useAutoScroll<HTMLDivElement>([chatHistory]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Currently playing audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add welcome message on first load
  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        type: 'system',
        content: `SYSTEM INITIALIZED. DOCUMENT INDEX: ${documents.length} FILE(S). HOW CAN I ASSIST?`,
        timestamp: new Date(),
      };
      addMessage(welcomeMessage);
    }
  }, []);

  /** Play base64-encoded WAV audio */
  const playBase64Audio = useCallback((b64: string) => {
    try {
      if (audioRef.current) { audioRef.current.pause(); }
      const audio = new Audio(`data:audio/wav;base64,${b64}`);
      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error('Audio playback failed:', err);
    }
  }, []);

  /** Play audio blob */
  const playBlobAudio = useCallback((blob: Blob) => {
    try {
      if (audioRef.current) { audioRef.current.pause(); }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch (err) {
      console.error('Audio playback failed:', err);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      if (useRAG) {
        // ── RAG mode: POST /ask ──
        const response = await queryText({ query: userMessage.content }, readScreen);
        const systemMessage: ChatMessage = {
          id: generateId(),
          type: 'system',
          content: response.answer,
          timestamp: new Date(),
        };
        addMessage(systemMessage);
        setCitations(response.citations);

        // Auto-TTS if enabled
        if (ttsEnabled) {
          try {
            const audioBlob = await synthesizeText(response.answer);
            playBlobAudio(audioBlob);
          } catch { /* TTS is best-effort */ }
        }
      } else {
        // ── Direct LLM mode: POST /chat ──
        const response = await chatDirect({ prompt: userMessage.content }, readScreen);
        const systemMessage: ChatMessage = {
          id: generateId(),
          type: 'system',
          content: response.response,
          timestamp: new Date(),
        };
        addMessage(systemMessage);
        setCitations([]);

        if (ttsEnabled) {
          try {
            const audioBlob = await synthesizeText(response.response);
            playBlobAudio(audioBlob);
          } catch { /* TTS is best-effort */ }
        }
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        type: 'system',
        content: `ERROR: ${err instanceof Error ? err.message : 'QUERY FAILED'}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, addMessage, useRAG, ttsEnabled, playBlobAudio]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleMicPressStart = useCallback(async () => {
    await startRecording();
  }, [startRecording]);

  const handleMicPressEnd = useCallback(async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob) return;

    setIsLoading(true);

    try {
      const response = await queryVoice(audioBlob, readScreen);

      // Add user message with transcript
      const userMessage: ChatMessage = {
        id: generateId(),
        type: 'user',
        content: response.transcription,
        timestamp: new Date(),
        isVoice: true,
      };
      addMessage(userMessage);

      // Add system response
      const systemMessage: ChatMessage = {
        id: generateId(),
        type: 'system',
        content: response.answer,
        timestamp: new Date(),
        audioBase64: response.audio_base64,
        isVoice: true,
      };
      addMessage(systemMessage);
      setCitations(response.citations);

      // Auto-play the TTS audio from voice pipeline
      if (response.audio_base64) {
        playBase64Audio(response.audio_base64);
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        type: 'system',
        content: `ERROR: ${err instanceof Error ? err.message : 'VOICE QUERY FAILED'}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stopRecording, addMessage, readScreen, playBase64Audio]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col relative">
      {/* Pixel Grid Background */}
      <div className="absolute inset-0 pixel-grid pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 py-4 border-b-4 border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-primary)]">{'>'}</span>
          <span className="pixel-text font-bold text-[var(--color-text-primary)]">CHAT</span>
          <div className="ml-4 px-2 py-0.5 border-2 border-[var(--color-primary)] bg-[var(--color-primary-dim)] text-[var(--color-primary)] pixel-text-xs">
            ⚡ MODEL: {useRAG ? 'SARVAM-1 (RAG)' : 'LLAMA-3.2 (DIRECT)'}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Mode Toggle: RAG vs Direct */}
          <div className="flex items-center gap-2">
            <span className="pixel-text-sm text-[var(--color-text-secondary)]">MODE:</span>
            <button
              onClick={() => setUseRAG(true)}
              className={`px-2 py-1 pixel-text-sm border-2 transition-colors ${useRAG
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
                }`}
            >
              RAG
            </button>
            <button
              onClick={() => setUseRAG(false)}
              className={`px-2 py-1 pixel-text-sm border-2 transition-colors ${!useRAG
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
                }`}
            >
              DIRECT
            </button>
          </div>

          {/* Screen Reader Toggle */}
          <button
            onClick={() => setReadScreen(!readScreen)}
            title="Toggle screen reader (OCR) context for voice queries"
            className={`px-2 py-1 pixel-text-sm border-2 transition-colors ${readScreen
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
              }`}
          >
            SCREEN OCR {readScreen ? 'ON' : 'OFF'}
          </button>

          {/* TTS Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            title="Auto-play text-to-speech on responses"
            className={`px-2 py-1 pixel-text-sm border-2 transition-colors ${ttsEnabled
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
              }`}
          >
            TTS {ttsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 space-y-6"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {chatHistory.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <div className="w-3 h-3 bg-[var(--color-primary)] animate-bounce" />
                <div className="w-3 h-3 bg-[var(--color-primary)] animate-bounce delay-100" />
                <div className="w-3 h-3 bg-[var(--color-primary)] animate-bounce delay-200" />
                <span className="pixel-text-sm ml-2">PROCESSING...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-4 border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
              <MicButton
                state={recordingState}
                onPressStart={handleMicPressStart}
                onPressEnd={handleMicPressEnd}
                disabled={isLoading}
              />

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={useRAG ? "ASK ABOUT YOUR DOCUMENTS..." : "CHAT DIRECTLY WITH LLM..."}
                  disabled={isLoading || recordingState !== 'idle'}
                  className="w-full px-4 py-3 pr-12 bg-[var(--color-bg)] border-2 border-[var(--color-border)] pixel-text text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] resize-none focus:outline-none focus:border-[var(--color-primary)]"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || recordingState !== 'idle'}
                className="w-14 h-14 flex items-center justify-center bg-[var(--color-primary)] text-white border-4 border-[var(--color-border)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ boxShadow: '4px 4px 0 var(--color-border)' }}
                aria-label="Send message"
              >
                <PixelSend className="w-6 h-6" />
              </button>
            </div>

            <div className="max-w-4xl mx-auto mt-2 text-center">
              <span className="pixel-text-sm text-[var(--color-text-secondary)]">
                [ENTER] TO SEND // HOLD MIC FOR VOICE // {useRAG ? 'RAG MODE' : 'DIRECT MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* Sources / Citations Panel */}
        <div className="w-80 border-l-4 border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
          <div className="p-4 border-b-4 border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PixelFolder className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="pixel-text font-bold">CITATIONS</span>
            </div>
            <span className="px-2 py-1 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-primary)] text-white">
              {citations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {citations.length === 0 ? (
              <div className="text-center py-8">
                <p className="pixel-text-sm text-[var(--color-text-secondary)]">
                  NO CITATIONS
                </p>
                <p className="pixel-text-sm text-[var(--color-text-disabled)] mt-1">
                  {useRAG ? 'ASK A QUESTION TO SEE SOURCES' : 'SWITCH TO RAG MODE FOR CITATIONS'}
                </p>
              </div>
            ) : (
              citations.map((citation, idx) => (
                <div
                  key={`citation-${idx}`}
                  className="p-3 border-2 border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] border-2 border-[var(--color-border)] flex items-center justify-center">
                    <span className="pixel-text-sm text-white font-bold">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="pixel-text-sm text-[var(--color-text-primary)] truncate">
                    {citation}
                  </span>
                </div>
              ))
            )}

            {/* Info block about current mode */}
            <div className="mt-4 p-3 border-2 border-dashed border-[var(--color-border)]">
              <p className="pixel-text-sm text-[var(--color-text-secondary)]">
                MODE: <span className="text-[var(--color-primary)]">{useRAG ? 'RAG' : 'DIRECT'}</span>
              </p>
              <p className="pixel-text-sm text-[var(--color-text-secondary)] mt-1">
                TTS: <span className={ttsEnabled ? 'text-[var(--color-success)]' : 'text-[var(--color-text-disabled)]'}>{ttsEnabled ? 'ON' : 'OFF'}</span>
              </p>
              <p className="pixel-text-sm text-[var(--color-text-secondary)] mt-1">
                SCREEN OCR: <span className={readScreen ? 'text-[var(--color-success)]' : 'text-[var(--color-text-disabled)]'}>{readScreen ? 'ON' : 'OFF'}</span>
              </p>
              <p className="pixel-text-sm text-[var(--color-text-secondary)] mt-1">
                DOCS: {documents.length}
              </p>
            </div>
          </div>

          {/* Upload Button */}
          <div className="p-4 border-t-4 border-[var(--color-border)]">
            <a
              href="#/upload"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--color-border)] pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors"
            >
              <PixelUpload className="w-4 h-4" />
              UPLOAD DOCUMENT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
