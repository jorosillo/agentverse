/**
 * Cliente de Mensajería — Bandeja + Chat activo.
 * Layout dividido: izquierda contactos, derecha chat.
 * Polling con setInterval para actualizaciones.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Cpu, Briefcase, CheckCircle2,
  DollarSign, AlertTriangle, ArrowLeft, PlusCircle
} from 'lucide-react';
import { getMessages, sendMessage, acceptProposal, updateConversationStatus, startConversation } from '@/server-actions/conversation.actions';
import { createReview, hasUserReviewed } from '@/server-actions/review.actions';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';

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

interface DraftConversation {
  recipientId: string;
  recipientName: string;
  resourceId: string;
  resourceType: 'agent' | 'job';
  resourceName: string;
}

interface Props {
  conversations: ConversationItem[];
  currentUserId: string;
  currentRole: string;
  initialActiveConvId?: string;
  draftConversation?: DraftConversation | null;
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

export function MessagesClient({ conversations, currentUserId, currentRole, initialActiveConvId, draftConversation }: Props) {
  const [activeConvId, setActiveConvId] = useState<string | null>(initialActiveConvId || null);
  const [isDrafting, setIsDrafting] = useState<boolean>(!!draftConversation && !initialActiveConvId);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptPrice, setAcceptPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(!!initialActiveConvId || !!draftConversation);
  
  // Review state
  const [hasReviewedState, setHasReviewedState] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    professional: 5,
    fulfillment: 5,
    communication: 5,
    comment: '',
  });

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
  const selectConversation = async (convId: string | null) => {
    setActiveConvId(convId);
    if (convId) {
      setIsDrafting(false);
      setShowMobileChat(true);
      loadMessages(convId);
      
      // Check if already reviewed
      const reviewed = await hasUserReviewed(convId);
      setHasReviewedState(reviewed);
      setShowReviewForm(false); // Reset form visibility
    } else {
      setShowMobileChat(true);
    }
  };

  // Poll for new messages every 5s
  useEffect(() => {
    if (!activeConvId || isDrafting) return;
    const interval = setInterval(() => loadMessages(activeConvId), 5000);
    return () => clearInterval(interval);
  }, [activeConvId, isDrafting, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!activeConvId && !isDrafting) return;

    setSending(true);

    if (isDrafting && draftConversation) {
      const result = await startConversation({
        recipientId: draftConversation.recipientId,
        agentId: draftConversation.resourceType === 'agent' ? draftConversation.resourceId : undefined,
        jobId: draftConversation.resourceType === 'job' ? draftConversation.resourceId : undefined,
        initialMessage: newMessage,
      });

      if (result.success) {
        setNewMessage('');
        setIsDrafting(false);
        setActiveConvId(result.data.conversationId);
        await loadMessages(result.data.conversationId);
        // Remove query params from url without refreshing
        window.history.replaceState(null, '', '/messages');
        router.refresh();
      } else {
        alert(result.error || 'Error al iniciar la conversación');
      }
    } else if (activeConvId) {
      const result = await sendMessage({ conversationId: activeConvId, content: newMessage });
      if (result.success) {
        setNewMessage('');
        await loadMessages(activeConvId);
        router.refresh();
      } else {
        alert(result.error || 'Error al enviar el mensaje');
      }
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

  // Submit review
  const handleSubmitReview = async () => {
    if (!activeConvId) return;
    setActionLoading(true);
    const result = await createReview({
      conversationId: activeConvId,
      professionalRating: reviewData.professional,
      fulfillmentRating: reviewData.fulfillment,
      communicationRating: reviewData.communication,
      comment: reviewData.comment,
    });
    
    if (result.success) {
      setHasReviewedState(true);
      setShowReviewForm(false);
      await loadMessages(activeConvId);
      router.refresh();
    } else {
      alert(result.error || 'Error al enviar la valoración');
    }
    setActionLoading(false);
  };

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (conversations.length === 0 && !draftConversation) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center sm:p-8 lg:p-12">
        <MessageSquare className="h-10 w-10 text-gray-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500 mb-2">No tienes conversaciones</p>
        <p className="text-xs text-gray-600">Contacta con un agente o postúlate a una oferta para empezar</p>
      </div>
    );
  }

  const hasActiveChat = activeConv !== undefined || isDrafting;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-[calc(100svh_-_var(--app-nav-height)_-_8.5rem)] min-h-[26rem] max-h-[44rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01] shadow-2xl sm:rounded-3xl">
      {/* Left sidebar — Conversation list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-white/[0.02]">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Conversaciones ({conversations.length})</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 sm:space-y-3">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv, currentUserId);
            const statusBadge = getStatusBadge(conv.status);
            const lastMsg = conv.messages[0];
            const isActive = activeConvId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-4 sm:px-5 py-4 sm:py-5 rounded-2xl transition-all relative group ${
                  isActive 
                    ? 'bg-violet-600/10 border border-violet-500/30' 
                    : 'hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full" />
                )}
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
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-gray-500">
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
          {draftConversation && (
            <button
              onClick={() => { setIsDrafting(true); setActiveConvId(null); setShowMobileChat(true); }}
              className={`w-full text-left px-4 sm:px-5 py-4 sm:py-5 rounded-2xl transition-all relative group ${
                isDrafting 
                  ? 'bg-violet-600/10 border border-violet-500/30' 
                  : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isDrafting && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full" />
              )}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-xs font-bold text-violet-400 flex-shrink-0">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">Nuevo Chat</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">Acerca de: {draftConversation.resourceName}</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Right panel — Active chat */}
      <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {!hasActiveChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-center">
            <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Selecciona un chat</h3>
            <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed">
              Elige una conversación de la izquierda para empezar a hablar con desarrolladores o empresas especializadas.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex items-center justify-between gap-3 sm:gap-4 bg-white/[0.01]">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button onClick={() => setShowMobileChat(false)} className="md:hidden text-gray-400 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-sm font-bold text-violet-400">
                  {isDrafting 
                    ? draftConversation?.recipientName.charAt(0) 
                    : activeConv && getParticipantName(getOtherParticipant(activeConv, currentUserId)).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">
                    {isDrafting 
                      ? draftConversation?.recipientName 
                      : activeConv && getParticipantName(getOtherParticipant(activeConv, currentUserId))}
                  </p>
                  {(isDrafting || activeConv?.agent || activeConv?.job) && (
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
                      {isDrafting ? (
                        draftConversation?.resourceType === 'agent' 
                          ? <><Cpu className="h-3 w-3" />{draftConversation.resourceName}</> 
                          : <><Briefcase className="h-3 w-3" />{draftConversation?.resourceName}</>
                      ) : (
                        activeConv?.agent 
                          ? <><Cpu className="h-3 w-3" />{activeConv.agent.name}</> 
                          : <><Briefcase className="h-3 w-3" />{activeConv?.job?.name}</>
                      )}
                    </p>
                  )}
                </div>
              </div>
              {!isDrafting && activeConv && (
                <span className={`shrink-0 px-3 py-1 text-[11px] font-medium rounded-full border shadow-sm ${getStatusBadge(activeConv.status).cls}`}>
                  {getStatusBadge(activeConv.status).label}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">
              {isDrafting ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Inicia la conversación</h3>
                  <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed">
                    Escribe tu primer mensaje para empezar a hablar con {draftConversation?.recipientName} sobre {draftConversation?.resourceName}.
                  </p>
                </div>
              ) : (
                <>
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
                        <div className={`max-w-[min(85%,42rem)] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 ${
                          isOwn
                            ? 'bg-violet-600/20 border border-violet-500/30 rounded-br-md shadow-lg shadow-violet-900/10'
                            : 'bg-white/[0.04] border border-white/5 rounded-bl-md shadow-sm'
                        }`}>
                          {!isOwn && <p className="text-xs font-medium text-violet-400/80 mb-1.5">{senderName}</p>}
                          <p className="text-[15px] leading-relaxed text-gray-200 whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className="text-[10px] text-gray-600 mt-2 text-right font-medium">{timeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Action bar (state machine) */}
            {!isDrafting && activeConv && activeConv.status !== 'COMPLETED' && activeConv.status !== 'ISSUE_REPORTED' && (
              <div className="px-4 py-3 border-t border-white/5 bg-white/[0.01]">
                {/* PENDING: Company can accept */}
                {activeConv.status === 'PENDING' && currentRole === 'COMPANY' && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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

            {/* Completed banner & Review trigger */}
            {!isDrafting && activeConv && activeConv.status === 'COMPLETED' && (
              <div className="flex flex-col border-t border-green-500/10">
                <div className="px-4 py-3 bg-green-500/[0.03] text-center">
                  <p className="text-xs text-green-400 flex items-center justify-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Acuerdo completado{activeConv.agreedPrice && ` — ${activeConv.agreedPrice.toLocaleString('es-ES')}€`}
                  </p>
                  {!hasReviewedState && !showReviewForm && (
                    <button 
                      onClick={() => setShowReviewForm(true)}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
                    >
                      Dejar una valoración sobre este acuerdo
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="px-4 py-6 bg-white/[0.02] border-t border-white/5">
                    <h4 className="text-sm font-semibold text-white mb-4 text-center">Valora tu experiencia</h4>
                    
                    <div className="space-y-5 max-w-sm mx-auto">
                      {[
                        { key: 'professional', label: 'Profesionalidad' },
                        { key: 'fulfillment', label: 'Cumplimiento' },
                        { key: 'communication', label: 'Comunicación' },
                      ].map((attr) => (
                        <div key={attr.key} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-gray-400">{attr.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewData({ ...reviewData, [attr.key]: star })}
                                className="transition-transform active:scale-110"
                              >
                                <Star 
                                  className={`h-4 w-4 ${
                                    star <= (reviewData as any)[attr.key] 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-600'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="mt-4">
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                          placeholder="Cuéntanos más sobre el trabajo realizado (opcional)..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[5rem] resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="flex-1 text-[11px]" 
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 text-[11px]" 
                          onClick={handleSubmitReview}
                          isLoading={actionLoading}
                        >
                          Enviar valoración
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {hasReviewedState && (
                  <div className="px-4 py-2 bg-violet-600/5 text-center border-t border-violet-500/10">
                    <p className="text-[10px] text-violet-400 flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-violet-400" />
                      Ya has valorado este acuerdo. ¡Gracias!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Message input */}
            {(isDrafting || (activeConv && activeConv.status !== 'COMPLETED' && activeConv.status !== 'ISSUE_REPORTED')) && (
              <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={isDrafting ? "Escribe un primer mensaje detallado (mín. 10 caracteres)..." : "Escribe un mensaje..."}
                    className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim() || (isDrafting && newMessage.length < 10)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {isDrafting && newMessage.length > 0 && newMessage.length < 10 && (
                  <p className="mt-2 text-[10px] text-red-400 px-1">El primer mensaje debe tener al menos 10 caracteres.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
