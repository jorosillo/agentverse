/**
 * Use Case: Verificación de correo electrónico.
 * Fuente: HU-06.
 * 
 * Reglas de negocio:
 * - Buscar token válido (no usado, no expirado)
 * - Marcar isEmailVerified = true
 * - Consumir token (marcar como usado)
 */
import { userRepository } from '@/infrastructure/repositories/user.repository';
import type { ActionResult } from '@/lib/types';

export async function verifyEmailUseCase(
  token: string
): Promise<ActionResult<{ userId: string }>> {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Token de verificación inválido' };
  }

  // 1. Buscar token válido
  const verificationRecord = await userRepository.findValidEmailVerificationToken(token);
  if (!verificationRecord) {
    return {
      success: false,
      error: 'El enlace de verificación es inválido o ha expirado. Solicita uno nuevo.',
    };
  }

  // 2. Marcar email como verificado
  await userRepository.updateEmailVerified(verificationRecord.userId, true);

  // 3. Consumir el token
  await userRepository.consumeEmailVerificationToken(verificationRecord.id);

  return {
    success: true,
    data: { userId: verificationRecord.userId },
  };
}
