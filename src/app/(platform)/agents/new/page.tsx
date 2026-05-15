/**
 * Página de creación de un nuevo Agente.
 * Fuente: HU-17. Solo DEVELOPER.
 */
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getAllCategories } from '@/server-actions/agent.actions';
import { CreateAgentForm } from '@/components/agents/CreateAgentForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publicar Agente',
  description: 'Publica un nuevo agente de IA en AgentVerse',
};

export default async function NewAgentPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');
  if (session.role !== 'DEVELOPER') redirect('/dashboard');

  const categoriesResult = await getAllCategories();
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="page-shell-narrow">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al catálogo
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Publicar nuevo agente</h1>
        <p className="text-sm text-gray-400 mt-1">
          Completa el formulario para publicar tu agente de IA en el marketplace
        </p>
      </div>

      <CreateAgentForm categories={categories} />
    </div>
  );
}
