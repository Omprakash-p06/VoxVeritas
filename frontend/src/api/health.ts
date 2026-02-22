import { apiGet } from './client';
import type { HealthStatus } from '@/types';

export async function getHealthStatus(): Promise<HealthStatus> {
  return apiGet<HealthStatus>('/health');
}
