/**
 * Use Case: Actualización de perfil de usuario.
 * Fuente: HU-10, HU-11.
 * 
 * Reglas:
 * - Email y rol son inmutables (plan.txt Fase 2)
 * - Solo el propio usuario puede editar su perfil
 * - isEmailVerified debe ser true para operaciones mutativas (rule four.md)
 */
import { profileRepository } from '@/infrastructure/repositories/profile.repository';
import {
  updateDeveloperProfileSchema,
  updateCompanyProfileSchema,
  type UpdateDeveloperProfileInput,
  type UpdateCompanyProfileInput,
} from '@/lib/schemas/profile.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function updateDeveloperProfileUseCase(
  session: SessionUser,
  input: UpdateDeveloperProfileInput
): Promise<ActionResult> {
  // 1. RBAC: Solo DEVELOPER puede actualizar perfil de developer
  if (session.role !== 'DEVELOPER') {
    return { success: false, error: 'No tienes permiso para esta acción.' };
  }

  // 2. Verificar email (rule four.md)
  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico antes de editar tu perfil.' };
  }

  // 3. Validar input
  const parsed = updateDeveloperProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  // 4. Actualizar perfil
  await profileRepository.updateDeveloperProfile(session.userId, parsed.data);

  return { success: true, data: undefined };
}

export async function updateCompanyProfileUseCase(
  session: SessionUser,
  input: UpdateCompanyProfileInput
): Promise<ActionResult> {
  if (session.role !== 'COMPANY') {
    return { success: false, error: 'No tienes permiso para esta acción.' };
  }

  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico antes de editar tu perfil.' };
  }

  const parsed = updateCompanyProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  await profileRepository.updateCompanyProfile(session.userId, parsed.data);

  return { success: true, data: undefined };
}
