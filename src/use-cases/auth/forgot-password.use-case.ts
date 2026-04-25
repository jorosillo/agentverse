/**
 * Use Case: Solicitud de restablecimiento de contraseña.
 * Fuente: HU-05.
 * 
 * Reglas de negocio:
 * - Siempre devolver éxito (no revelar si el email existe)
 * - Crear token de reset (30 min validez)
 * - Enviar email con enlace de reset via Resend
 */
import { userRepository } from '@/infrastructure/repositories/user.repository';
import { sendPasswordResetEmail } from '@/infrastructure/services/email.service';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import type { ActionResult } from '@/lib/types';

export async function forgotPasswordUseCase(
  input: ForgotPasswordInput
): Promise<ActionResult> {
  // 1. Validar input
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Correo electrónico inválido' };
  }

  const { email } = parsed.data;

  // 2. Buscar usuario (SIEMPRE devolver éxito para prevenir enumeración)
  const user = await userRepository.findByEmail(email);

  if (user) {
    // 3. Crear token de reset
    const resetToken = await userRepository.createPasswordResetToken(user.id);

    // 4. Enviar email (async, no bloquea)
    sendPasswordResetEmail(email, resetToken.token).catch((err) => {
      console.error('Error enviando email de reset:', err);
    });
  }

  // Siempre devolver éxito (anti-enumeración)
  return {
    success: true,
    data: undefined,
  };
}
