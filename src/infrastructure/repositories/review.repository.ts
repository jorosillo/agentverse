/**
 * Repositorio de Reviews/Valoraciones — Capa de acceso a datos.
 * Triple rúbrica (1-5): Profesionalidad, Cumplimiento, Comunicación.
 * Constraint: 1 review por reviewer por conversation.
 */
import { prisma } from '@/infrastructure/database/prisma';

export const reviewRepository = {
  async create(data: {
    conversationId: string;
    reviewerId: string;
    targetId: string;
    professionalRating: number;
    fulfillmentRating: number;
    communicationRating: number;
    comment?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.reviewFeedback.create({
        data: {
          conversationId: data.conversationId,
          reviewerId: data.reviewerId,
          targetId: data.targetId,
          professionalRating: data.professionalRating,
          fulfillmentRating: data.fulfillmentRating,
          communicationRating: data.communicationRating,
          comment: data.comment || null,
        },
      });

      // Crear ReputationEvent para el target
      const avgRating = (data.professionalRating + data.fulfillmentRating + data.communicationRating) / 3;
      await tx.reputationEvent.create({
        data: {
          userId: data.targetId,
          type: 'REVIEW_RECEIVED',
          value: avgRating,
          metadata: { conversationId: data.conversationId, reviewId: review.id },
        },
      });

      return review;
    });
  },

  async findByConversation(conversationId: string) {
    return prisma.reviewFeedback.findMany({
      where: { conversationId },
      include: {
        reviewer: {
          select: {
            id: true, avatarUrl: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
      },
    });
  },

  async findByTarget(targetId: string) {
    return prisma.reviewFeedback.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        reviewer: {
          select: {
            id: true, role: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
      },
    });
  },

  async hasReviewed(conversationId: string, reviewerId: string) {
    const existing = await prisma.reviewFeedback.findUnique({
      where: { conversationId_reviewerId: { conversationId, reviewerId } },
    });
    return !!existing;
  },

  async getAverageForUser(userId: string) {
    const result = await prisma.reviewFeedback.aggregate({
      where: { targetId: userId },
      _avg: {
        professionalRating: true,
        fulfillmentRating: true,
        communicationRating: true,
      },
      _count: true,
    });
    return {
      averageProfessional: result._avg.professionalRating || 0,
      averageFulfillment: result._avg.fulfillmentRating || 0,
      averageCommunication: result._avg.communicationRating || 0,
      totalReviews: result._count,
    };
  },
};
