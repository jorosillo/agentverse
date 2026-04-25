/**
 * Página de edición de una Oferta existente.
 * Fuente: HU-25. Solo el owner puede editar.
 */
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getJobById } from '@/server-actions/job.actions';
import { EditJobForm } from '@/components/jobs/EditJobForm';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Oferta',
  description: 'Edita la información de tu oferta de trabajo',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');
  if (session.role !== 'COMPANY') redirect('/dashboard');

  const { id } = await params;
  const result = await getJobById(id);

  if (!result.success || !result.data) notFound();
  if (result.data.ownerCompanyId !== session.userId) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href={`/jobs/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a la oferta
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar oferta</h1>
        <p className="text-sm text-gray-400 mt-1">Actualiza la información de tu oferta de trabajo</p>
      </div>

      <EditJobForm job={result.data} />
    </div>
  );
}
