import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  PixelUpload, PixelFile, PixelTrash, PixelRefresh, PixelFilter,
  PixelDatabase, PixelHardDrive, PixelTerminal
} from '@/components/ui-custom/PixelIcons';
import { listDocuments, uploadDocument, deleteDocument } from '@/api/upload';
import { useAppStore } from '@/store/AppContext';
import { useHealthPoll } from '@/hooks/useHealthPoll';
import type { Document, UploadProgress } from '@/types';
import { format } from 'date-fns';

export function UploadView() {
  const { documents, setDocuments, removeDocument } = useAppStore();
  const { health } = useHealthPoll(15000);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [showLogs, setShowLogs] = useState(true);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    '> SYSTEM INITIALIZED',
    '> WAITING FOR INPUT...',
    '> READY.',
  ]);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; doc: Document | null }>({
    isOpen: false,
    doc: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  const addLog = useCallback((message: string) => {
    const timestamp = format(new Date(), 'HH:mm:ss');
    setSystemLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await listDocuments();
      setDocuments(data.documents);
      addLog(`LOADED ${data.total} DOCUMENT(S)`);
    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : 'FAILED TO LOAD'}`);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['.pdf', '.docx', '.txt', '.md'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExt)) {
      addLog('ERROR: INVALID FILE TYPE');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      addLog('ERROR: FILE EXCEEDS 10MB');
      return;
    }

    setUploadProgress({ filename: file.name, progress: 0, status: 'uploading' });
    addLog(`UPLOADING ${file.name.toUpperCase()}...`);

    try {
      const result = await uploadDocument(file);
      setDocuments([...documents, {
        doc_id: result.doc_id,
        filename: result.filename,
        chunks: result.chunks,
        uploaded_at: new Date().toISOString(),
        detected_languages: result.detected_languages,
      }]);
      setUploadProgress({ filename: file.name, progress: 100, status: 'completed' });
      addLog(`SUCCESS: ${result.chunks} CHUNKS INDEXED`);
      
      setTimeout(() => setUploadProgress(null), 3000);
    } catch (err) {
      setUploadProgress({ filename: file.name, progress: 0, status: 'error' });
      addLog(`ERROR: UPLOAD FAILED`);
    }
  };

  const handleDeleteClick = (doc: Document) => {
    setDeleteDialog({ isOpen: true, doc });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.doc) return;

    try {
      await deleteDocument(deleteDialog.doc.doc_id);
      removeDocument(deleteDialog.doc.doc_id);
      addLog(`DELETED ${deleteDialog.doc.filename.toUpperCase()}`);
    } catch (err) {
      addLog('ERROR: DELETE FAILED');
    } finally {
      setDeleteDialog({ isOpen: false, doc: null });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      {/* Pixel Grid Background */}
      <div className="absolute inset-0 pixel-grid pointer-events-none" />
      
      <div className="relative z-10 p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 pixel-text-sm text-[var(--color-text-secondary)] mb-2">
                <PixelTerminal className="w-4 h-4" />
                <span>{'> INIT_SEQUENCE_COMPLETE'}</span>
              </div>
              <h1 className="pixel-text-xl text-[var(--color-text-primary)]">
                <span className="text-[var(--color-primary)]">UPLOAD</span>
              </h1>
              <p className="pixel-text-sm text-[var(--color-text-secondary)] mt-1 cursor-blink">
                {'>'} INGEST FILES FOR PARSING AND INDEXING
              </p>
            </div>
            <div className="text-right">
              <div className="pixel-text-sm text-[var(--color-text-secondary)]">
                MODE: <span className="text-[var(--color-primary)]">UPLOAD</span>
              </div>
              <div className="pixel-text-sm text-[var(--color-text-secondary)] mt-1">
                {format(new Date(), 'HH:mm MM/dd/yy')}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Drop Zone & Logs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drop Zone */}
              <div
                role="region"
                aria-label="File upload area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-4 border-dashed p-12 text-center cursor-pointer
                  transition-all duration-100
                  ${isDragging 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)]'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {/* Corner decorations */}
                <div className="pixel-corner pixel-corner-tl" />
                <div className="pixel-corner pixel-corner-tr" />
                <div className="pixel-corner pixel-corner-bl" />
                <div className="pixel-corner pixel-corner-br" />
                
                <div className="w-20 h-20 mx-auto mb-4 bg-[var(--color-primary)] border-4 border-[var(--color-border)] flex items-center justify-center">
                  <PixelUpload className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="pixel-text-lg font-bold text-[var(--color-text-primary)] mb-2 tracking-wider">
                  DROP FILES HERE
                </h3>
                <p className="pixel-text-sm text-[var(--color-text-secondary)]">
                  or click to browse
                </p>
                
                <div className="mt-6 pt-6 border-t-2 border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-4 pixel-text-sm text-[var(--color-text-secondary)]">
                    <div>
                      <span className="text-[var(--color-text-primary)] font-bold">FORMATS:</span>
                      <br />PDF, DOCX, TXT, MD
                    </div>
                    <div>
                      <span className="text-[var(--color-text-primary)] font-bold">MAX SIZE:</span>
                      <br />10 MB
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-[var(--color-surface-raised)] border-t-4 border-[var(--color-border)]">
                    <div className="flex items-center justify-between pixel-text-sm mb-2">
                      <span className="text-[var(--color-text-primary)]">{uploadProgress.filename}</span>
                      <span className={`
                        ${uploadProgress.status === 'completed' ? 'text-[var(--color-success)]' : ''}
                        ${uploadProgress.status === 'error' ? 'text-[var(--color-danger)]' : ''}
                      `}>
                        {uploadProgress.status === 'uploading' && 'UPLOADING...'}
                        {uploadProgress.status === 'completed' && 'DONE'}
                        {uploadProgress.status === 'error' && 'ERROR'}
                      </span>
                    </div>
                    <div className="h-4 bg-[var(--color-border)] border-2 border-[var(--color-border)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--color-primary)] transition-all duration-300"
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* System Logs */}
              {showLogs && (
              <div className="border-4 border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
                <div className="px-4 py-2 border-b-4 border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
                  <span className="pixel-text-sm text-[var(--color-text-secondary)]">SYSTEM_LOG</span>
                  <PixelTerminal className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div className="p-4 h-32 overflow-y-auto pixel-text-sm space-y-1 font-mono">
                  {systemLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`
                        ${log.includes('ERROR') ? 'text-[var(--color-danger)]' : ''}
                        ${log.includes('SUCCESS') ? 'text-[var(--color-success)]' : ''}
                        ${!log.includes('ERROR') && !log.includes('SUCCESS') ? 'text-[var(--color-text-secondary)]' : ''}
                      `}
                    >
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
              )}
            </div>

            {/* Right Column - Storage & Actions */}
            <div className="space-y-6">
              {/* Storage Usage */}
              <div className="border-4 border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h3 className="pixel-text font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <PixelHardDrive className="w-5 h-5 text-[var(--color-primary)]" />
                  STORAGE USAGE
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between pixel-text-sm mb-1">
                      <span className="text-[var(--color-text-secondary)]">VECTOR DB</span>
                      <span className="text-[var(--color-text-primary)]">{documents.reduce((acc, d) => acc + d.chunks, 0)} CHUNKS</span>
                    </div>
                    <div className="h-4 bg-[var(--color-border)] border-2 border-[var(--color-border)] overflow-hidden">
                      <div className="h-full w-1/3 bg-[var(--color-primary)]" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between pixel-text-sm mb-1">
                      <span className="text-[var(--color-text-secondary)]">GPU VRAM</span>
                      <span className="text-[var(--color-text-primary)]">
                        {health?.gpu ? `${(health.gpu.vram_used_mb / 1024).toFixed(1)}GB / ${(health.gpu.vram_total_mb / 1024).toFixed(1)}GB` : 'N/A'}
                      </span>
                    </div>
                    <div className="h-4 bg-[var(--color-border)] border-2 border-[var(--color-border)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--color-primary)]" 
                        style={{ width: `${health?.gpu?.vram_total_mb ? Math.round((health.gpu.vram_used_mb / health.gpu.vram_total_mb) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-4 border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <h3 className="pixel-text font-bold text-[var(--color-text-primary)] mb-4">
                  QUICK ACTIONS
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={loadDocuments}
                    className="w-full flex items-center gap-2 px-3 py-2 pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] border-2 border-transparent hover:border-[var(--color-border)] transition-all text-left"
                  >
                    <PixelRefresh className="w-4 h-4" />
                    RE-INDEX ALL
                  </button>
                  <button 
                    onClick={() => { setSystemLogs(['> CACHE CLEARED']); addLog('CACHE CLEARED — LOCAL STATE RESET'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] border-2 border-transparent hover:border-[var(--color-border)] transition-all text-left"
                  >
                    <PixelDatabase className="w-4 h-4" />
                    CLEAR CACHE
                  </button>
                  <button 
                    onClick={() => setShowLogs(prev => !prev)}
                    className="w-full flex items-center gap-2 px-3 py-2 pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] border-2 border-transparent hover:border-[var(--color-border)] transition-all text-left"
                  >
                    <PixelTerminal className="w-4 h-4" />
                    {showLogs ? 'HIDE LOGS' : 'VIEW LOGS'}
                  </button>
                </div>
              </div>

              {/* Decorative Pixels */}
              <div className="grid grid-cols-4 gap-2">
                <div className="aspect-square bg-[var(--color-primary)] border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-surface)] border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-primary)]/50 border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-surface-raised)] border-2 border-[var(--color-border)]" />
              </div>
            </div>
          </div>

          {/* Document List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="pixel-text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                UPLOADED_DOCUMENTS
                <span className="px-2 py-1 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-primary)] text-white">
                  {documents.length}
                </span>
              </h2>
              <button className="flex items-center gap-2 px-3 py-1.5 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors">
                <PixelFilter className="w-4 h-4" />
                FILTER
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="border-4 border-dashed border-[var(--color-border)] p-8 text-center">
                <PixelFile className="w-8 h-8 text-[var(--color-text-disabled)] mx-auto mb-2" />
                <p className="pixel-text-sm text-[var(--color-text-secondary)]">
                  NO DOCUMENTS UPLOADED
                </p>
                <p className="pixel-text-sm text-[var(--color-text-disabled)] mt-1">
                  DROP A FILE TO GET STARTED
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.doc_id}
                    className="flex items-center gap-4 p-4 border-4 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] transition-colors"
                  >
                    <div className="w-12 h-12 bg-[var(--color-surface-raised)] border-2 border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                      <PixelFile className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="pixel-text text-[var(--color-text-primary)] truncate">
                          {doc.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 pixel-text-sm text-[var(--color-text-secondary)]">
                        <span>ID:{doc.doc_id.slice(0, 8)}</span>
                        <span>·</span>
                        <span>{formatFileSize(doc.chunks * 1024)}</span>
                        <span>·</span>
                        <span>{format(new Date(doc.uploaded_at), 'yyyy-MM-dd')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="pixel-text-lg font-bold text-[var(--color-text-primary)]">
                          {doc.chunks}
                        </div>
                        <div className="pixel-text-sm text-[var(--color-text-secondary)]">
                          CHUNKS
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {doc.detected_languages.map((lang) => (
                          <span 
                            key={lang}
                            className="px-2 py-1 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleDeleteClick(doc)}
                        className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 border-2 border-transparent hover:border-[var(--color-danger)] transition-all"
                        aria-label={`Delete ${doc.filename}`}
                      >
                        <PixelTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && deleteDialog.doc && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-[var(--color-surface)] border-4 border-[var(--color-border)] p-6 max-w-md w-full mx-4 relative">
            {/* Corner decorations */}
            <div className="pixel-corner pixel-corner-tl" />
            <div className="pixel-corner pixel-corner-tr" />
            <div className="pixel-corner pixel-corner-bl" />
            <div className="pixel-corner pixel-corner-br" />
            
            <h3 id="delete-dialog-title" className="pixel-text-lg font-bold text-[var(--color-text-primary)] mb-2">
              CONFIRM DELETE
            </h3>
            <p className="pixel-text-sm text-[var(--color-text-secondary)] mb-6">
              DELETE <span className="text-[var(--color-text-primary)]">{deleteDialog.doc.filename.toUpperCase()}</span>? 
              THIS REMOVES {deleteDialog.doc.chunks} CHUNKS.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, doc: null })}
                className="px-4 py-2 pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-2 border-transparent hover:border-[var(--color-border)] transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 pixel-text-sm bg-[var(--color-danger)] text-white border-2 border-[var(--color-danger)] hover:bg-[var(--color-danger)]/80 transition-colors"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
