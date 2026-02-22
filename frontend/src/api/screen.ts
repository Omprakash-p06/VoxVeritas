import { apiPost } from './client';
import type { ScreenOCRResponse } from '@/types';

export async function ocrUploadedScreenshot(imageBlob: Blob): Promise<ScreenOCRResponse> {
  const formData = new FormData();
  formData.append('file', imageBlob, 'screen-capture.png');
  return apiPost<ScreenOCRResponse>('/screen/ocr/upload', formData);
}
