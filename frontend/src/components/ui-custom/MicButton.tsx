import { PixelMic } from './PixelIcons';
import type { RecordingState } from '@/hooks/useAudioRecorder';

interface MicButtonProps {
  state: RecordingState;
  onPressStart: () => void;
  onPressEnd: () => void;
  disabled?: boolean;
}

export function MicButton({ state, onPressStart, onPressEnd, disabled }: MicButtonProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  const getLabel = () => {
    if (isProcessing) return '...';
    if (isRecording) return 'REC';
    return 'MIC';
  };

  const getAriaLabel = () => {
    if (isProcessing) return 'Transcribing audio, please wait';
    if (isRecording) return 'Recording, release to stop';
    return 'Hold to speak';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onMouseDown={onPressStart}
        onMouseUp={onPressEnd}
        onMouseLeave={isRecording ? onPressEnd : undefined}
        onTouchStart={onPressStart}
        onTouchEnd={onPressEnd}
        disabled={disabled || isProcessing}
        className={`
          relative w-16 h-16 flex items-center justify-center
          border-4 border-[var(--color-border)]
          transition-all duration-100
          ${isRecording 
            ? 'bg-[var(--color-danger)] animate-pulse' 
            : isProcessing
              ? 'bg-[var(--color-surface-raised)] cursor-wait'
              : 'bg-[var(--color-surface)] hover:bg-[var(--color-primary-subtle)]'
          }
        `}
        aria-label={getAriaLabel()}
        aria-pressed={isRecording}
        aria-busy={isProcessing}
        style={{
          boxShadow: isRecording ? 'none' : '4px 4px 0 var(--color-border)',
          transform: isRecording ? 'translate(2px, 2px)' : 'none'
        }}
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        ) : (
          <PixelMic className={`w-8 h-8 ${isRecording ? 'text-white' : ''}`} />
        )}
      </button>
      <span className="pixel-text-sm text-[var(--color-text-secondary)] tracking-wider">
        {getLabel()}
      </span>
    </div>
  );
}
