/**
 * Página de recuperación de contraseña.
 * Fuente: HU-05.
 */
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Solicita un enlace para restablecer tu contraseña',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
