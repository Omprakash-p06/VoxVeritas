import { apiGet, apiPost, apiDelete } from './client';
import type { 
  DocumentListResponse, 
  UploadResponse, 
  DeleteResponse 
} from '@/types';

export async function listDocuments(): Promise<DocumentListResponse> {
  return apiGet<DocumentListResponse>('/documents');
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiPost<UploadResponse>('/upload', formData);
}

export async function deleteDocument(docId: string): Promise<DeleteResponse> {
  return apiDelete<DeleteResponse>(`/document/${docId}`);
}
