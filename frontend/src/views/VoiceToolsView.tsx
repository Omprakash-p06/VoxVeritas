import { useState, useCallback, useRef } from 'react';
import { PixelTerminal } from '@/components/ui-custom/PixelIcons';
import { transcribeAudio, synthesizeText } from '@/api/query';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { MicButton } from '@/components/ui-custom/MicButton';
import { format } from 'date-fns';

export function VoiceToolsView() {
  // ── STT state ──
  const { state: recordingState, startRecording, stopRecording } = useAudioRecorder();
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // ── TTS state ──
  const [ttsInput, setTtsInput] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // ── Logs ──
  const [logs, setLogs] = useState<string[]>(['> VOICE TOOLS READY']);

  const addLog = useCallback((msg: string) => {
    const ts = format(new Date(), 'HH:mm:ss');
    setLogs(prev => [...prev, `[${ts}] ${msg}`]);
  }, []);

  // ── STT handlers ──
  const handleMicStart = useCallback(async () => {
    await startRecording();
    addLog('RECORDING...');
  }, [startRecording, addLog]);

  const handleMicEnd = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob) return;

    setIsTranscribing(true);
    addLog('TRANSCRIBING AUDIO...');
    try {
      const res = await transcribeAudio(blob);
      setTranscription(res.transcription);
      addLog(`SUCCESS: "${res.transcription.slice(0, 60)}..."`);
    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : 'TRANSCRIPTION FAILED'}`);
    } finally {
      setIsTranscribing(false);
    }
  }, [stopRecording, addLog]);

  // ── File upload for STT ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileTranscribe = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    addLog(`TRANSCRIBING ${file.name.toUpperCase()}...`);
    try {
      const res = await transcribeAudio(file);
      setTranscription(res.transcription);
      addLog(`TRANSCRIPTION COMPLETE (${res.transcription.length} chars)`);
    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : 'TRANSCRIPTION FAILED'}`);
    } finally {
      setIsTranscribing(false);
    }
  }, [addLog]);

  // ── TTS handler ──
  const handleSynthesize = useCallback(async () => {
    if (!ttsInput.trim()) return;

    setIsSynthesizing(true);
    addLog('SYNTHESIZING SPEECH...');
    try {
      const blob = await synthesizeText(ttsInput.trim());
      const url = URL.createObjectURL(blob);

      // Clean up previous URL
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);

      // Auto-play
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      addLog('TTS COMPLETE — PLAYING AUDIO');
    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : 'SYNTHESIS FAILED'}`);
    } finally {
      setIsSynthesizing(false);
    }
  }, [ttsInput, audioUrl, addLog]);

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      <div className="absolute inset-0 pixel-grid pointer-events-none" />

      <div className="relative z-10 p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 pixel-text-sm text-[var(--color-text-secondary)] mb-2">
              <PixelTerminal className="w-4 h-4" />
              <span>{'> VOICE_TOOLS'}</span>
            </div>
            <h1 className="pixel-text-xl text-[var(--color-text-primary)]">
              <span className="text-[var(--color-primary)]">VOICE</span> TOOLS
            </h1>
            <p className="pixel-text-sm text-[var(--color-text-secondary)] mt-1">
              {'>'} STANDALONE SPEECH-TO-TEXT &amp; TEXT-TO-SPEECH
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Speech-to-Text Panel ── */}
            <div className="border-4 border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="pixel-text-lg font-bold text-[var(--color-text-primary)]">
                SPEECH → TEXT <span className="pixel-text-sm text-[var(--color-text-secondary)]">(Whisper)</span>
              </h2>

              <div className="flex items-center gap-4">
                <MicButton
                  state={recordingState}
                  onPressStart={handleMicStart}
                  onPressEnd={handleMicEnd}
                  disabled={isTranscribing}
                />
                <span className="pixel-text-sm text-[var(--color-text-secondary)]">
                  HOLD TO RECORD
                </span>

                <span className="pixel-text-sm text-[var(--color-text-disabled)]">or</span>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTranscribing}
                  className="px-4 py-2 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                >
                  UPLOAD AUDIO
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,.mp3,.m4a,.ogg,.flac"
                  onChange={handleFileTranscribe}
                  className="hidden"
                />
              </div>

              {isTranscribing && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <div className="w-3 h-3 bg-[var(--color-primary)] animate-bounce" />
                  <span className="pixel-text-sm">TRANSCRIBING...</span>
                </div>
              )}

              <div className="border-2 border-[var(--color-border)] bg-[var(--color-bg)] p-4 min-h-[120px]">
                <p className="pixel-text-sm text-[var(--color-text-secondary)] mb-1">TRANSCRIPTION:</p>
                {transcription ? (
                  <p className="pixel-text text-[var(--color-text-primary)]">{transcription}</p>
                ) : (
                  <p className="pixel-text-sm text-[var(--color-text-disabled)]">
                    NO TRANSCRIPTION YET
                  </p>
                )}
              </div>

              {transcription && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcription);
                    addLog('TRANSCRIPTION COPIED TO CLIPBOARD');
                  }}
                  className="px-4 py-2 pixel-text-sm border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                >
                  COPY TO CLIPBOARD
                </button>
              )}
            </div>

            {/* ── Text-to-Speech Panel ── */}
            <div className="border-4 border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="pixel-text-lg font-bold text-[var(--color-text-primary)]">
                TEXT → SPEECH <span className="pixel-text-sm text-[var(--color-text-secondary)]">(Kokoro TTS)</span>
              </h2>

              <textarea
                value={ttsInput}
                onChange={(e) => setTtsInput(e.target.value)}
                placeholder="ENTER TEXT TO SYNTHESIZE..."
                disabled={isSynthesizing}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border-2 border-[var(--color-border)] pixel-text text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] resize-none focus:outline-none focus:border-[var(--color-primary)]"
                rows={4}
              />

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSynthesize}
                  disabled={!ttsInput.trim() || isSynthesizing}
                  className="px-6 py-3 bg-[var(--color-primary)] text-white border-4 border-[var(--color-border)] pixel-text-sm font-bold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ boxShadow: '4px 4px 0 var(--color-border)' }}
                >
                  {isSynthesizing ? 'SYNTHESIZING...' : 'SYNTHESIZE'}
                </button>

                {audioUrl && (
                  <a
                    href={audioUrl}
                    download="synthesized_audio.wav"
                    className="px-4 py-2 pixel-text-sm border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                  >
                    DOWNLOAD WAV
                  </a>
                )}
              </div>

              {isSynthesizing && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <div className="w-3 h-3 bg-[var(--color-primary)] animate-bounce" />
                  <span className="pixel-text-sm">GENERATING AUDIO...</span>
                </div>
              )}

              {audioUrl && (
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <p className="pixel-text-sm text-[var(--color-text-secondary)] mb-2">AUDIO OUTPUT:</p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}
            </div>
          </div>

          {/* System Log */}
          <div className="border-4 border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
            <div className="px-4 py-2 border-b-4 border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
              <span className="pixel-text-sm text-[var(--color-text-secondary)]">VOICE_LOG</span>
              <button
                onClick={() => setLogs([])}
                className="pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                CLEAR
              </button>
            </div>
            <div className="p-4 h-32 overflow-y-auto pixel-text-sm space-y-1 font-mono">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`
                    ${log.includes('ERROR') ? 'text-[var(--color-danger)]' : ''}
                    ${log.includes('SUCCESS') || log.includes('COMPLETE') ? 'text-[var(--color-success)]' : ''}
                    ${!log.includes('ERROR') && !log.includes('SUCCESS') && !log.includes('COMPLETE') ? 'text-[var(--color-text-secondary)]' : ''}
                  `}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
