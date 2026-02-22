import type { ApiError } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export class ApiClientError extends Error {
  code: string;
  requestId: string;
  
  constructor(
    message: string,
    code: string,
    requestId: string
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.requestId = requestId;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Unknown error';
    let errorCode = 'UNKNOWN_ERROR';
    try {
      const json = await response.json();
      // FastAPI returns { detail: "..." } on HTTPException
      if (json.detail) {
        errorMessage = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
      } else if (json.error) {
        const error = (json as ApiError).error;
        errorMessage = error?.message ?? 'Unknown error';
        errorCode = error?.code ?? 'UNKNOWN_ERROR';
      }
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiClientError(errorMessage, errorCode, 'unknown');
  }

  // Backend returns flat JSON — return it directly (no .data wrapper)
  const json = await response.json();
  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: FormData | object): Promise<T> {
  const isForm = body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPostRaw(path: string, body: FormData | object): Promise<Response> {
  const isForm = body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new ApiClientError(response.statusText, 'REQUEST_FAILED', 'unknown');
  }
  return response;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  return handleResponse<T>(response);
}

export function getBaseUrl(): string {
  return BASE_URL;
}

export function getAudioUrl(filename: string): string {
  return `${BASE_URL}/audio/${filename}`;
}
