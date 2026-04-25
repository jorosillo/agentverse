/**
 * Repositorio de Mensajes — Capa de acceso a datos.
 * CRUD de mensajes + paginación por conversación.
 */
import { prisma } from '@/infrastructure/database/prisma';

export const messageRepository = {
  async create(data: {
    conversationId: string;
    senderId: string;
    content: string;
    isSystemMessage?: boolean;
  }) {
    // 1. Crear mensaje
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        isSystemMessage: data.isSystemMessage || false,
      },
      include: {
        sender: {
          select: {
            id: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
      },
    });

    // 2. Actualizar updatedAt de la conversación
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  },

  async findByConversation(conversationId: string, cursor?: string, limit = 30) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit,
      include: {
        sender: {
          select: {
            id: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
      },
    });
  },

  async countByUserInLastHour(userId: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return prisma.message.count({
      where: { senderId: userId, createdAt: { gte: oneHourAgo } },
    });
  },
};
