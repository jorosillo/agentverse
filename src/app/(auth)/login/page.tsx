/**
 * Página de Login.
 * Fuente: AgentVerse.md — Inicio de Sesión (HU-03).
 */
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a tu cuenta de AgentVerse',
};

export default function LoginPage() {
  return <LoginForm />;
}
