/**
 * Página de Mensajería — Bandeja de entrada y Chat.
 * Fuente: HU-31 a HU-36.
 * Layout: Izquierda = contactos, Derecha = chat activo.
 */
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getConversations } from '@/server-actions/conversation.actions';
import { getAgentById } from '@/server-actions/agent.actions';
import { getJobById } from '@/server-actions/job.actions';
import { conversationRepository } from '@/infrastructure/repositories/conversation.repository';
import { MessagesClient } from '@/components/messages/MessagesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mensajes',
  description: 'Gestiona tus conversaciones en AgentVerse',
};

interface Props {
  searchParams: Promise<{ agentId?: string; jobId?: string }>;
}

export default async function MessagesPage({ searchParams }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { agentId, jobId } = await searchParams;
  const result = await getConversations();

  let initialActiveConvId: string | undefined;
  let draftConversation = null;

  if (result.success && (agentId || jobId)) {
    try {
      let recipientId: string | undefined;
      let recipientName = 'Usuario';
      let resourceName = 'Recurso';
      let resourceType: 'agent' | 'job' = 'agent';

      if (agentId) {
        const agentResult = await getAgentById(agentId);
        if (agentResult.success && agentResult.data) {
          recipientId = agentResult.data.authorId;
          recipientName = agentResult.data.author?.developerProfile?.fullName || 'Desarrollador';
          resourceName = agentResult.data.name;
          resourceType = 'agent';
        }
      } else if (jobId) {
        const jobResult = await getJobById(jobId);
        if (jobResult.success && jobResult.data) {
          recipientId = jobResult.data.ownerCompanyId;
          recipientName = jobResult.data.ownerCompany?.companyProfile?.companyName || 'Empresa';
          resourceName = jobResult.data.name;
          resourceType = 'job';
        }
      }

      if (recipientId && recipientId !== session.userId) {
        // Verificar si ya existe
        const existing = await conversationRepository.findExisting(
          session.userId,
          recipientId,
          agentId,
          jobId
        );

        if (existing) {
          initialActiveConvId = existing.id;
        } else {
          draftConversation = {
            recipientId,
            recipientName,
            resourceId: agentId || jobId!,
            resourceType,
            resourceName,
          };
        }
      }
    } catch (e) {
      console.error('Error preparating conversation draft', e);
    }
  }

  return (
    <div className="page-shell">
      <h1 className="text-2xl font-bold text-white mb-6">Mensajes</h1>

      {!result.success ? (
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5 sm:p-6 lg:p-8 text-center">
          <p className="text-sm text-red-400">{result.error}</p>
        </div>
      ) : (
        <MessagesClient
          conversations={result.data}
          currentUserId={result.currentUserId}
          currentRole={session.role}
          initialActiveConvId={initialActiveConvId}
          draftConversation={draftConversation}
        />
      )}
    </div>
  );
}
