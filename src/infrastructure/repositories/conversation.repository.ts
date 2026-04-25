/**
 * Repositorio de Conversaciones — Capa de acceso a datos.
 * Máquina de estados: PENDING → IN_PROGRESS → PENDING_CERTIFICATION → COMPLETED
 */
import { prisma } from '@/infrastructure/database/prisma';
import type { ConversationStatus } from '@prisma/client';

export const conversationRepository = {
  async create(data: {
    participantAId: string;
    participantBId: string;
    agentId?: string;
    jobId?: string;
    initialMessage: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          participantAId: data.participantAId,
          participantBId: data.participantBId,
          agentId: data.agentId || null,
          jobId: data.jobId || null,
          status: 'PENDING',
        },
      });

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: data.participantAId,
          content: data.initialMessage,
        },
      });

      return conversation;
    });
  },

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        participantA: {
          select: {
            id: true, avatarUrl: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
        participantB: {
          select: {
            id: true, avatarUrl: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
        agent: { select: { id: true, name: true } },
        job: { select: { id: true, name: true } },
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [
          { participantAId: userId },
          { participantBId: userId },
        ],
      },
      include: {
        participantA: {
          select: {
            id: true, avatarUrl: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
        participantB: {
          select: {
            id: true, avatarUrl: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
        agent: { select: { id: true, name: true } },
        job: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async updateStatus(id: string, status: ConversationStatus, agreedPrice?: number) {
    return prisma.conversation.update({
      where: { id },
      data: {
        status,
        ...(agreedPrice !== undefined ? { agreedPrice } : {}),
      },
    });
  },

  async findExisting(participantAId: string, participantBId: string, agentId?: string, jobId?: string) {
    return prisma.conversation.findFirst({
      where: {
        OR: [
          { participantAId, participantBId },
          { participantAId: participantBId, participantBId: participantAId },
        ],
        ...(agentId ? { agentId } : {}),
        ...(jobId ? { jobId } : {}),
      },
    });
  },
};
