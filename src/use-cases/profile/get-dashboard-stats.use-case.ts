/**
 * Use Case: Obtener métricas del Dashboard.
 * Fuente: plan.txt Fase 2.
 */
import { profileRepository } from '@/infrastructure/repositories/profile.repository';
import type { SessionUser } from '@/lib/types';

export async function getDashboardStatsUseCase(session: SessionUser) {
  if (session.role === 'DEVELOPER') {
    return profileRepository.getDeveloperDashboardStats(session.userId);
  }
  return profileRepository.getCompanyDashboardStats(session.userId);
}
