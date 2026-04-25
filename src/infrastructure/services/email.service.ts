/**
 * Servicio de email transaccional via Resend.
 * Responsable del envío de:
 * - Correos de verificación de email (HU-06)
 * - Correos de restablecimiento de contraseña (HU-05)
 * Solo importable desde la capa de infraestructura/use-cases.
 * 
 * En desarrollo sin API key: los emails se loguean a consola.
 */
import { Resend } from 'resend';

// ============================================================================
// CONFIGURACIÓN (Lazy initialization para evitar errores de build)
// ============================================================================

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'AgentVerse <noreply@agentverse.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================================
// FUNCIONES PÚBLICAS
// ============================================================================

/**
 * Envía un correo de verificación de email.
 * @param email - Dirección de correo del destinatario.
 * @param token - Token único de verificación.
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  const resend = getResend();
  if (!resend) {
    console.log(`[DEV] Email de verificación para ${email}: ${verificationUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verifica tu cuenta de AgentVerse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5CF6;">Bienvenido a AgentVerse</h1>
        <p>Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verificar mi correo
        </a>
        <p style="color: #6B7280; font-size: 14px;">
          Este enlace caduca en 24 horas. Si no solicitaste la verificación, ignora este correo.
        </p>
      </div>
    `,
  });
}

/**
 * Envía un correo de restablecimiento de contraseña.
 * @param email - Dirección de correo del destinatario.
 * @param token - Token único de restablecimiento (caduca en 30 min).
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const resend = getResend();
  if (!resend) {
    console.log(`[DEV] Email de reset para ${email}: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Restablece tu contraseña de AgentVerse',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B5CF6;">Restablecer contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Restablecer contraseña
        </a>
        <p style="color: #6B7280; font-size: 14px;">
          Este enlace caduca en 30 minutos. Si no solicitaste este cambio, ignora este correo.
        </p>
      </div>
    `,
  });
}
