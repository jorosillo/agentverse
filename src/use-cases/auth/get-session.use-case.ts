/**
 * Use Case: Obtener sesión actual.
 * Lee el JWT de la cookie HttpOnly y devuelve los datos del usuario.
 */
import { cookies } from 'next/headers';
import { verifyToken, SESSION_COOKIE_NAME } from '@/infrastructure/services/auth.service';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import type { SessionUser, UserWithProfile } from '@/lib/types';

/**
 * Obtiene la sesión del usuario actual desde la cookie JWT.
 * @returns SessionUser si hay sesión válida, null si no.
 */
export async function getSessionUseCase(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    isEmailVerified: payload.isEmailVerified,
  };
}

/**
 * Obtiene la sesión del usuario actual con su perfil completo.
 * Útil para páginas que necesitan datos del perfil (dashboard, etc).
 */
export async function getSessionWithProfileUseCase(): Promise<UserWithProfile | null> {
  const session = await getSessionUseCase();
  if (!session) return null;

  const user = await userRepository.findByIdWithProfile(session.userId);
  return user;
}
