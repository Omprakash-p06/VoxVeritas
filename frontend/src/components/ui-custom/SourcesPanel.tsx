import { useState } from 'react';
import { PixelFile, PixelChevronDown, PixelChevronUp, PixelFolder } from './PixelIcons';
import type { Source } from '@/types';

interface SourcesPanelProps {
  sources: Source[];
}

interface SourceCardProps {
  source: Source;
  isExpanded: boolean;
  onToggle: () => void;
}

function SourceCard({ source, isExpanded, onToggle }: SourceCardProps) {
  const getFileIcon = () => {
    if (source.filename.endsWith('.pdf')) return 'PDF';
    if (source.filename.endsWith('.txt')) return 'TXT';
    if (source.filename.endsWith('.docx')) return 'DOCX';
    return 'FILE';
  };

  return (
    <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-start gap-3 text-left hover:bg-[var(--color-surface-raised)] transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-primary)] border-2 border-[var(--color-border)] flex items-center justify-center">
          <span className="pixel-text-sm text-white font-bold">
            {getFileIcon()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="pixel-text text-[var(--color-text-primary)] truncate">
              {source.filename}
            </span>
            {isExpanded ? (
              <PixelChevronUp className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
            ) : (
              <PixelChevronDown className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 pixel-text-sm text-[var(--color-text-secondary)]">
            <span>ID:{source.doc_id.slice(0, 6)}</span>
            <span>·</span>
            <span>p.{source.page}</span>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 border-t-2 border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="pt-3">
            <p className="pixel-text-sm text-[var(--color-text-secondary)] leading-relaxed">
              &ldquo;{source.text}&rdquo;
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="pixel-text-sm text-[var(--color-text-secondary)]">
                Chunk:{source.chunk_index}
              </span>
              <span 
                className={`
                  px-2 py-0.5 pixel-text-sm border-2
                  ${source.similarity_score >= 0.8 
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                    : 'border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning)]/10'
                  }
                `}
              >
                {(source.similarity_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (sources.length === 0) return null;

  return (
    <div className="border-l-4 border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-4 border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PixelFolder className="w-5 h-5 text-[var(--color-primary)]" />
          <span className="pixel-text font-bold tracking-wider">SOURCES</span>
        </div>
        <span className="px-2 py-1 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-primary)] text-white">
          {sources.length}
        </span>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sources.length === 0 ? (
          <div className="text-center py-8">
            <PixelFile className="w-8 h-8 text-[var(--color-text-disabled)] mx-auto mb-2" />
            <p className="pixel-text-sm text-[var(--color-text-secondary)]">
              No sources yet
            </p>
            <p className="pixel-text-sm text-[var(--color-text-disabled)] mt-1">
              Ask a question to see sources
            </p>
          </div>
        ) : (
          sources.map((source, idx) => (
            <SourceCard
              key={`${source.doc_id}-${source.chunk_index}`}
              source={source}
              isExpanded={expandedIndex === idx}
              onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}
