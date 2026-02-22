import { useState } from 'react';
import { format } from 'date-fns';
import type { ChatMessage } from '@/types';
import { getAudioUrl } from '@/api/client';
import { PixelUser, PixelBot, PixelPlay, PixelPause, PixelVolume, PixelClock } from './PixelIcons';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.type === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayAudio = () => {
    const audioSrc = message.audioBase64
      ? `data:audio/wav;base64,${message.audioBase64}`
      : message.audioUrl
        ? getAudioUrl(message.audioUrl)
        : null;

    if (!audioSrc) return;
    
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      const newAudio = new Audio(audioSrc);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  const formatTime = (date: Date) => format(date, 'HH:mm:ss');

  return (
    <div 
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="listitem"
    >
      {/* Avatar */}
      <div 
        className={`
          w-10 h-10 border-2 border-[var(--color-border)] flex items-center justify-center flex-shrink-0
          ${isUser 
            ? 'bg-[var(--color-primary)] text-white' 
            : 'bg-[var(--color-surface-raised)]'
          }
        `}
      >
        {isUser ? <PixelUser className="w-6 h-6" /> : <PixelBot className="w-6 h-6 text-[var(--color-primary)]" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="pixel-text-sm text-[var(--color-text-secondary)]">
            {isUser ? 'USER' : 'SYSTEM'} :: {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`
            relative px-4 py-3 border-2 border-[var(--color-border)]
            ${isUser
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-primary)]'
            }
          `}
        >
          {/* Corner decorations */}
          <div className={`pixel-corner pixel-corner-tl ${isUser ? 'border-white' : ''}`} />
          <div className={`pixel-corner pixel-corner-tr ${isUser ? 'border-white' : ''}`} />
          <div className={`pixel-corner pixel-corner-bl ${isUser ? 'border-white' : ''}`} />
          <div className={`pixel-corner pixel-corner-br ${isUser ? 'border-white' : ''}`} />

          {/* Content */}
          <div className="whitespace-pre-wrap pixel-text relative z-10">
            {message.content}
          </div>

          {/* Source chips for system messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 relative z-10">
              {message.sources.map((source, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                  title={source.text}
                >
                  <span className="text-[var(--color-primary)]">{source.filename}</span>
                  <span className="text-[var(--color-text-secondary)]">·</span>
                  <span>p.{source.page}</span>
                </span>
              ))}
            </div>
          )}

          {/* Audio player for voice responses */}
          {!isUser && (message.audioUrl || message.audioBase64) && (
            <div className="mt-3 flex items-center gap-2 relative z-10">
              <button
                onClick={handlePlayAudio}
                className="flex items-center gap-2 px-3 py-1.5 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-primary)] transition-colors"
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isPlaying ? (
                  <><PixelPause className="w-4 h-4" /> PAUSE</>
                ) : (
                  <><PixelPlay className="w-4 h-4" /> PLAY</>
                )}
              </button>
              <PixelVolume className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </div>
          )}

          {/* Metadata badges */}
          {!isUser && (message.latency || message.confidence) && (
            <div className="mt-3 flex items-center gap-2 relative z-10">
              {message.latency && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-bg)]">
                  <PixelClock className="w-3 h-3" />
                  LATENCY: {message.latency}ms
                </span>
              )}
              {message.confidence && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-bg)]">
                  CONFIDENCE: {message.confidence}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
