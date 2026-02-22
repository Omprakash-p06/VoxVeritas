// API Response Types — Backend returns flat JSON (no wrapper)
// These are kept for backward compat but not used by handleResponse anymore.
export interface ApiResponse<T> {
  data: T;
  request_id: string;
  latency_ms: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    request_id: string;
  };
}

// Health Check Types (matches backend HealthResponse)
export interface HealthStatus {
  status: string;
  version: string;
  models: {
    llm: string;
    llm_loaded: boolean;
    llm_backend: string;
    stt: string;
    stt_loaded: boolean;
    tts: string;
    tts_loaded: boolean;
    embedder: string;
    embedder_loaded: boolean;
  };
  vector_store: {
    connected: boolean;
    document_count: number;
    chunk_count: number;
  };
  gpu: {
    vram_used_mb: number;
    vram_total_mb: number;
    device: string;
  };
}

// Document Types (matches backend DocumentInfo)
export interface Document {
  doc_id: string;
  filename: string;
  chunks: number;
  uploaded_at: string;
  detected_languages: string[];
}

// Matches backend DocumentListResponse
export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

// Matches backend IngestionResponse
export interface UploadResponse {
  doc_id: string;
  filename: string;
  chunks: number;
  detected_languages: string[];
  status: string;
}

// Matches backend DeleteResponse
export interface DeleteResponse {
  success: boolean;
  doc_id: string;
  chunks_removed: number;
}

// Source Types — built from RAG context metadata
export interface Source {
  doc_id: string;
  filename: string;
  page: number;
  chunk_index: number;
  text: string;
  similarity_score: number;
}

// Query Types — text RAG (/ask)
export interface TextQueryRequest {
  query: string;
}

// Backend RAGResponse is { answer, citations: string[] }
export interface TextQueryResponse {
  answer: string;
  citations: string[];
  model: string;
}

// Direct LLM chat (/chat)
export interface ChatRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatDirectResponse {
  response: string;
  model: string;
  citations: string[];
}

// Voice RAG (/ask_voice)
export interface VoiceQueryResponse {
  transcription: string;
  answer: string;
  citations: string[];
  audio_base64: string;
  model: string;
}

// Standalone transcribe (/transcribe)
export interface TranscribeResponse {
  status: string;
  transcription: string;
}

// Standalone synthesize (/synthesize) — returns binary audio, no JSON

// Safety Types (matches backend SafetyReport)
export interface SafetyReport {
  run_id: string;
  timestamp: string;
  status: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    pass_rate: number;
  };
  categories: {
    hallucination: CategoryResult;
    prompt_injection: CategoryResult;
    harmful_advice: CategoryResult;
  };
  failures: SafetyFailure[];
}

export interface CategoryResult {
  total: number;
  passed: number;
  failed: number;
}

export interface SafetyFailure {
  test_id: string;
  category: string;
  prompt: string;
  expected: string;
  actual: string;
}

export interface SafetyRunResponse {
  run_id: string;
  status: string;
  message: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
  audioUrl?: string;
  audioBase64?: string;
  isVoice?: boolean;
  latency?: number;
  confidence?: number;
}

// Upload Progress Type
export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}
