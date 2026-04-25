/**
 * Página de creación de nueva Oferta de Trabajo.
 * Fuente: HU-24. Solo COMPANY.
 */
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { CreateJobForm } from '@/components/jobs/CreateJobForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publicar Oferta',
  description: 'Publica una nueva oferta de trabajo en AgentVerse',
};

export default async function NewJobPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');
  if (session.role !== 'COMPANY') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al catálogo
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Publicar nueva oferta</h1>
        <p className="text-sm text-gray-400 mt-1">
          Describe qué tipo de agente de IA necesitas para tu empresa
        </p>
      </div>

      <CreateJobForm />
    </div>
  );
}
