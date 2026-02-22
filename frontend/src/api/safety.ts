import { apiGet, apiPost } from './client';
import type { SafetyReport, SafetyRunResponse } from '@/types';

export async function getSafetyReport(): Promise<SafetyReport> {
  return apiGet<SafetyReport>('/safety/report');
}

export async function runSafetyTests(testSuite: string = 'default'): Promise<SafetyRunResponse> {
  return apiPost<SafetyRunResponse>('/safety/run', { test_suite: testSuite });
}
