/**
 * Use Case: Restablecimiento de contraseña.
 * Fuente: HU-05.
 * 
 * Reglas de negocio:
 * - Buscar token válido (no usado, no expirado, 30 min)
 * - Hash nueva contraseña con bcrypt
 * - Actualizar contraseña en BD
 * - Consumir token
 */
import bcrypt from 'bcryptjs';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth.schema';
import type { ActionResult } from '@/lib/types';

const BCRYPT_SALT_ROUNDS = 12;

export async function resetPasswordUseCase(
  input: ResetPasswordInput
): Promise<ActionResult> {
  // 1. Validar input
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const { token, password } = parsed.data;

  // 2. Buscar token válido
  const resetRecord = await userRepository.findValidPasswordResetToken(token);
  if (!resetRecord) {
    return {
      success: false,
      error: 'El enlace de restablecimiento es inválido o ha expirado.',
    };
  }

  // 3. Hash de la nueva contraseña
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // 4. Actualizar contraseña en BD
  await userRepository.updatePassword(resetRecord.userId, passwordHash);

  // 5. Consumir token
  await userRepository.consumePasswordResetToken(resetRecord.id);

  return { success: true, data: undefined };
}
