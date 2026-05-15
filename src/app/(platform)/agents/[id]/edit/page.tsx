/**
 * Página de edición de un Agente existente.
 * Fuente: HU-18. Solo el autor puede editar.
 */
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getAgentById, getAllCategories } from '@/server-actions/agent.actions';
import { EditAgentForm } from '@/components/agents/EditAgentForm';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar Agente',
  description: 'Edita la información de tu agente de IA',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');
  if (session.role !== 'DEVELOPER') redirect('/dashboard');

  const { id } = await params;
  const [result, categoriesResult] = await Promise.all([
    getAgentById(id),
    getAllCategories(),
  ]);

  if (!result.success || !result.data) notFound();

  // Solo el autor puede editar
  if (result.data.authorId !== session.userId) redirect('/dashboard');

  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="page-shell-narrow">
      <Link
        href={`/agents/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al agente
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar agente</h1>
        <p className="text-sm text-gray-400 mt-1">
          Actualiza la información de tu agente de IA
        </p>
      </div>

      <EditAgentForm agent={result.data} categories={categories} />
    </div>
  );
}
