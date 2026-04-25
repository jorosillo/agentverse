/**
 * Server Actions para gestión de perfil de usuario.
 * Fase 2: Perfil, Dashboard y Onboarding.
 */
'use server';

import { redirect } from 'next/navigation';
import { getSessionUseCase } from '@/use-cases/auth/get-session.use-case';
import { updateDeveloperProfileUseCase, updateCompanyProfileUseCase } from '@/use-cases/profile/update-profile.use-case';
import { deleteAccountUseCase } from '@/use-cases/profile/delete-account.use-case';
import { getDashboardStatsUseCase } from '@/use-cases/profile/get-dashboard-stats.use-case';
import { profileRepository } from '@/infrastructure/repositories/profile.repository';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import type { UpdateDeveloperProfileInput, UpdateCompanyProfileInput, DeleteAccountInput } from '@/lib/schemas/profile.schema';
import type { ActionResult, UserWithProfile } from '@/lib/types';

// ============================================================================
// HELPERS
// ============================================================================

async function requireSession() {
  const session = await getSessionUseCase();
  if (!session) {
    throw new Error('NOT_AUTHENTICATED');
  }
  return session;
}

// ============================================================================
// GET PROFILE
// ============================================================================

/**
 * Obtiene el perfil completo del usuario actual.
 */
export async function getProfile(): Promise<ActionResult<UserWithProfile>> {
  try {
    const session = await requireSession();
    const user = await userRepository.findByIdWithProfile(session.userId);

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    return { success: true, data: user };
  } catch {
    return { success: false, error: 'Error al obtener el perfil.' };
  }
}

/**
 * Obtiene el perfil público de un usuario.
 */
export async function getPublicProfile(userId: string) {
  try {
    const profile = await profileRepository.getPublicProfile(userId);
    if (!profile) {
      return { success: false as const, error: 'Perfil no encontrado.' };
    }
    return { success: true as const, data: profile };
  } catch {
    return { success: false as const, error: 'Error al obtener el perfil.' };
  }
}

// ============================================================================
// UPDATE PROFILE (HU-10, HU-11)
// ============================================================================

/**
 * Actualiza el perfil de un DEVELOPER.
 */
export async function updateDeveloperProfile(
  input: UpdateDeveloperProfileInput
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await updateDeveloperProfileUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al actualizar el perfil.' };
  }
}

/**
 * Actualiza el perfil de una COMPANY.
 */
export async function updateCompanyProfile(
  input: UpdateCompanyProfileInput
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await updateCompanyProfileUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al actualizar el perfil.' };
  }
}

// ============================================================================
// EMAIL PREFERENCES
// ============================================================================

/**
 * Actualiza las preferencias de notificación por email.
 */
export async function updateEmailPreferences(
  emailPreferences: boolean
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await profileRepository.updateEmailPreferences(session.userId, emailPreferences);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: 'Error al actualizar las preferencias.' };
  }
}

// ============================================================================
// ONBOARDING
// ============================================================================

/**
 * Marca el onboarding como completado.
 */
export async function completeOnboarding(): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await profileRepository.completeOnboarding(session.userId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: 'Error al completar el onboarding.' };
  }
}

// ============================================================================
// DELETE ACCOUNT (HU-13 – GDPR)
// ============================================================================

/**
 * Elimina la cuenta del usuario actual.
 * Requiere confirmación exacta "ELIMINAR MI CUENTA".
 */
export async function deleteAccount(
  input: DeleteAccountInput
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const result = await deleteAccountUseCase(session, input);

    if (result.success) {
      // Limpiar sesión y redirigir (se maneja después del return)
      redirect('/');
    }

    return result;
  } catch (error) {
    // redirect() throws a NEXT_REDIRECT error, let it propagate
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { success: false, error: 'Error al eliminar la cuenta.' };
  }
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Obtiene las estadísticas del dashboard del usuario actual.
 */
export async function getDashboardStats() {
  try {
    const session = await requireSession();
    const stats = await getDashboardStatsUseCase(session);
    return { success: true as const, data: stats, role: session.role };
  } catch {
    return { success: false as const, error: 'Error al obtener estadísticas.' };
  }
}
