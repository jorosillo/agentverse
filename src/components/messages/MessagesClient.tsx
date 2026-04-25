/**
 * Cliente de Mensajería — Bandeja + Chat activo.
 * Layout dividido: izquierda contactos, derecha chat.
 * Polling con setInterval para actualizaciones.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Cpu, Briefcase, Clock, CheckCircle2,
  DollarSign, AlertTriangle, ArrowLeft,
} from 'lucide-react';
import { getMessages, sendMessage, acceptProposal, updateConversationStatus } from '@/server-actions/conversation.actions';
import { Button } from '@/components/ui/Button';

// ============================================================================
// TYPES
// ============================================================================

interface Participant {
  id: string;
  avatarUrl: string | null;
  role: string;
  developerProfile?: { fullName: string } | null;
  companyProfile?: { companyName: string } | null;
}

interface ConversationItem {
  id: string;
  participantA: Participant;
  participantB: Participant;
  agent?: { id: string; name: string } | null;
  job?: { id: string; name: string } | null;
  status: string;
  agreedPrice: number | null;
  updatedAt: Date | string;
  messages: { content: string; createdAt: Date | string; senderId: string }[];
}

interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  isSystemMessage: boolean;
  createdAt: Date | string;
  sender: {
    id: string;
    role: string;
    developerProfile?: { fullName: string } | null;
    companyProfile?: { companyName: string } | null;
  };
}

interface Props {
  conversations: ConversationItem[];
  currentUserId: string;
  currentRole: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getParticipantName(p: Participant): string {
  return p.developerProfile?.fullName || p.companyProfile?.companyName || 'Usuario';
}

function getOtherParticipant(conv: ConversationItem, currentUserId: string): Participant {
  return conv.participantA.id === currentUserId ? conv.participantB : conv.participantA;
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Pendiente', cls: 'bg-yellow-600/10 text-yellow-400 border-yellow-500/20' },
    IN_PROGRESS: { label: 'En progreso', cls: 'bg-blue-600/10 text-blue-400 border-blue-500/20' },
    PENDING_CERTIFICATION: { label: 'Pendiente certificación', cls: 'bg-orange-600/10 text-orange-400 border-orange-500/20' },
    COMPLETED: { label: 'Completado', cls: 'bg-green-600/10 text-green-400 border-green-500/20' },
    ISSUE_REPORTED: { label: 'Incidencia', cls: 'bg-red-600/10 text-red-400 border-red-500/20' },
  };
  return map[status] || { label: status, cls: 'bg-gray-600/10 text-gray-400 border-gray-500/20' };
}

function timeAgo(dateStr: Date | string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MessagesClient({ conversations, currentUserId, currentRole }: Props) {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptPrice, setAcceptPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Load messages
  const loadMessages = useCallback(async (convId: string) => {
    setLoading(true);
    const result = await getMessages(convId);
    if (result.success) {
      setMessages(result.data as MessageItem[]);
    }
    setLoading(false);
  }, []);

  // Select conversation
  const selectConversation = (convId: string) => {
    setActiveConvId(convId);
    setShowMobileChat(true);
    loadMessages(convId);
  };

  // Poll for new messages every 5s
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => loadMessages(activeConvId), 5000);
    return () => clearInterval(interval);
  }, [activeConvId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId) return;
    setSending(true);
    const result = await sendMessage({ conversationId: activeConvId, content: newMessage });
    if (result.success) {
      setNewMessage('');
      await loadMessages(activeConvId);
      router.refresh();
    }
    setSending(false);
  };

  // Accept proposal
  const handleAccept = async () => {
    if (!activeConvId || !acceptPrice) return;
    setActionLoading(true);
    const result = await acceptProposal({ conversationId: activeConvId, agreedPrice: parseFloat(acceptPrice) });
    if (result.success) {
      setAcceptPrice('');
      await loadMessages(activeConvId);
      router.refresh();
    }
    setActionLoading(false);
  };

  // State transitions
  const handleAction = async (action: 'complete' | 'certify' | 'cancel') => {
    if (!activeConvId) return;
    setActionLoading(true);
    const result = await updateConversationStatus({ conversationId: activeConvId, action });
    if (result.success) {
      await loadMessages(activeConvId);
      router.refresh();
    }
    setActionLoading(false);
  };

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
        <MessageSquare className="h-10 w-10 text-gray-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500 mb-2">No tienes conversaciones</p>
        <p className="text-xs text-gray-600">Contacta con un agente o postúlate a una oferta para empezar</p>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Left sidebar — Conversation list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Conversaciones ({conversations.length})</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv, currentUserId);
            const statusBadge = getStatusBadge(conv.status);
            const lastMsg = conv.messages[0];
            const isActive = activeConvId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-all ${isActive ? 'bg-white/[0.05] border-l-2 border-l-violet-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-xs font-bold text-violet-400 flex-shrink-0">
                    {getParticipantName(other).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">{getParticipantName(other)}</p>
                      {lastMsg && <span className="text-[10px] text-gray-600 flex-shrink-0">{timeAgo(lastMsg.createdAt)}</span>}
                    </div>
                    {(conv.agent || conv.job) && (
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        {conv.agent ? <><Cpu className="h-2.5 w-2.5" />{conv.agent.name}</> : <><Briefcase className="h-2.5 w-2.5" />{conv.job?.name}</>}
                      </p>
                    )}
                    {lastMsg && <p className="text-xs text-gray-500 truncate mt-1">{lastMsg.content}</p>}
                    <span className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] rounded-full border ${statusBadge.cls}`}>{statusBadge.label}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — Active chat */}
      <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Selecciona una conversación</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <button onClick={() => setShowMobileChat(false)} className="md:hidden text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/10 text-xs font-bold text-violet-400">
                {getParticipantName(getOtherParticipant(activeConv, currentUserId)).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getParticipantName(getOtherParticipant(activeConv, currentUserId))}
                </p>
                {(activeConv.agent || activeConv.job) && (
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    {activeConv.agent ? <><Cpu className="h-2.5 w-2.5" />{activeConv.agent.name}</> : <><Briefcase className="h-2.5 w-2.5" />{activeConv.job?.name}</>}
                  </p>
                )}
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getStatusBadge(activeConv.status).cls}`}>
                {getStatusBadge(activeConv.status).label}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
              )}

              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                const senderName = msg.sender.developerProfile?.fullName || msg.sender.companyProfile?.companyName || 'Sistema';

                if (msg.isSystemMessage) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-gray-500 max-w-sm text-center">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? 'bg-violet-600/20 border border-violet-500/30 rounded-br-md'
                        : 'bg-white/[0.04] border border-white/5 rounded-bl-md'
                    }`}>
                      {!isOwn && <p className="text-[10px] text-gray-500 mb-1">{senderName}</p>}
                      <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-[9px] text-gray-600 mt-1 text-right">{timeAgo(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Action bar (state machine) */}
            {activeConv.status !== 'COMPLETED' && activeConv.status !== 'ISSUE_REPORTED' && (
              <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01]">
                {/* PENDING: Company can accept */}
                {activeConv.status === 'PENDING' && currentRole === 'COMPANY' && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <input
                      type="number"
                      value={acceptPrice}
                      onChange={(e) => setAcceptPrice(e.target.value)}
                      placeholder="Importe acordado (€)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                    <Button size="sm" onClick={handleAccept} isLoading={actionLoading} className="!bg-green-600 hover:!bg-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aceptar
                    </Button>
                  </div>
                )}

                {/* IN_PROGRESS: Developer can complete */}
                {activeConv.status === 'IN_PROGRESS' && currentRole === 'DEVELOPER' && (
                  <Button size="sm" onClick={() => handleAction('complete')} isLoading={actionLoading}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Marcar como completado
                  </Button>
                )}

                {/* PENDING_CERTIFICATION: Company can certify */}
                {activeConv.status === 'PENDING_CERTIFICATION' && currentRole === 'COMPANY' && (
                  <Button size="sm" onClick={() => handleAction('certify')} isLoading={actionLoading} className="!bg-green-600 hover:!bg-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Certificar entrega
                  </Button>
                )}

                {/* Cancel available for non-completed */}
                {activeConv.status !== 'COMPLETED' && (
                  <button onClick={() => handleAction('cancel')} className="mt-2 flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Reportar problema
                  </button>
                )}
              </div>
            )}

            {/* Completed banner */}
            {activeConv.status === 'COMPLETED' && (
              <div className="px-4 py-2 border-t border-green-500/10 bg-green-500/[0.03] text-center">
                <p className="text-xs text-green-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Acuerdo completado{activeConv.agreedPrice && ` — ${activeConv.agreedPrice.toLocaleString('es-ES')}€`}
                </p>
              </div>
            )}

            {/* Message input */}
            {activeConv.status !== 'COMPLETED' && activeConv.status !== 'ISSUE_REPORTED' && (
              <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
