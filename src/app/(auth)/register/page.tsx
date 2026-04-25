/**
 * Página de Registro.
 * Fuente: AgentVerse.md — Registro (HU-01, HU-02).
 */
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Regístrate en AgentVerse como desarrollador o empresa',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
