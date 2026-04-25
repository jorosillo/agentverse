/**
 * Página de Mensajería — Bandeja de entrada y Chat.
 * Fuente: HU-31 a HU-36.
 * Layout: Izquierda = contactos, Derecha = chat activo.
 */
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getConversations } from '@/server-actions/conversation.actions';
import { MessagesClient } from '@/components/messages/MessagesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mensajes',
  description: 'Gestiona tus conversaciones en AgentVerse',
};

export default async function MessagesPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const result = await getConversations();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Mensajes</h1>

      {!result.success ? (
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-8 text-center">
          <p className="text-sm text-red-400">{result.error}</p>
        </div>
      ) : (
        <MessagesClient
          conversations={result.data}
          currentUserId={result.currentUserId}
          currentRole={session.role}
        />
      )}
    </div>
  );
}
