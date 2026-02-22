import { apiPost, apiPostRaw } from './client';
import type {
  TextQueryRequest,
  TextQueryResponse,
  VoiceQueryResponse,
  ChatRequest,
  ChatDirectResponse,
  TranscribeResponse,
} from '@/types';

/** RAG-grounded Q&A — POST /ask */
export async function queryText(
  request: TextQueryRequest,
  readScreen: boolean = false,
  screenContext?: string,
): Promise<TextQueryResponse> {
  return apiPost<TextQueryResponse>('/ask', {
    query: request.query,
    read_screen: readScreen,
    screen_context: screenContext,
  });
}

/** Direct LLM chat (no document grounding) — POST /chat */
export async function chatDirect(
  request: ChatRequest,
  readScreen: boolean = false,
  screenContext?: string,
): Promise<ChatDirectResponse> {
  return apiPost<ChatDirectResponse>('/chat', {
    ...request,
    read_screen: readScreen,
    screen_context: screenContext,
  });
}

/** Full voice RAG pipeline — POST /ask_voice */
export async function queryVoice(
  audioBlob: Blob,
  readScreen: boolean = false,
): Promise<VoiceQueryResponse> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  formData.append('read_screen', String(readScreen));
  return apiPost<VoiceQueryResponse>('/ask_voice', formData);
}

/** Standalone speech-to-text — POST /transcribe */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  return apiPost<TranscribeResponse>('/transcribe', formData);
}

/** Standalone text-to-speech — POST /synthesize (returns audio blob) */
export async function synthesizeText(text: string): Promise<Blob> {
  const response = await apiPostRaw('/synthesize', { text });
  return response.blob();
}
