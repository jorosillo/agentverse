/**
 * Repositorio de Moderación — Reports y BlockList.
 * Capa de acceso a datos para sistema de confianza.
 */
import { prisma } from '@/infrastructure/database/prisma';
import type { ReportCategory } from '@prisma/client';

export const moderationRepository = {
  // --------------------------------------------------------------------------
  // REPORTS
  // --------------------------------------------------------------------------

  async createReport(data: {
    reporterId: string;
    reportedUserId: string;
    category: ReportCategory;
    reason?: string;
  }) {
    return prisma.report.create({ data });
  },

  async getReportsByUser(reportedUserId: string) {
    return prisma.report.findMany({
      where: { reportedUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            developerProfile: { select: { fullName: true } },
            companyProfile: { select: { companyName: true } },
          },
        },
      },
    });
  },

  // --------------------------------------------------------------------------
  // BLOCKLIST
  // --------------------------------------------------------------------------

  async blockUser(blockerId: string, blockedId: string) {
    return prisma.blockList.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    });
  },

  async unblockUser(blockerId: string, blockedId: string) {
    return prisma.blockList.deleteMany({
      where: { blockerId, blockedId },
    });
  },

  async isBlocked(blockerId: string, blockedId: string) {
    const block = await prisma.blockList.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });
    return !!block;
  },

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await prisma.blockList.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    return blocks.map((b) => b.blockedId);
  },

  // --------------------------------------------------------------------------
  // REPUTACIÓN (CRON JOB HELPER)
  // --------------------------------------------------------------------------

  async recalculateReputation(userId: string) {
    const [reviews, completedCount, account] = await Promise.all([
      prisma.reviewFeedback.aggregate({
        where: { targetId: userId },
        _avg: {
          professionalRating: true,
          fulfillmentRating: true,
          communicationRating: true,
        },
        _count: true,
      }),
      prisma.conversation.count({
        where: {
          OR: [{ participantAId: userId }, { participantBId: userId }],
          status: 'COMPLETED',
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
    ]);

    const avgRating =
      ((reviews._avg.professionalRating || 0) +
        (reviews._avg.fulfillmentRating || 0) +
        (reviews._avg.communicationRating || 0)) / 3;

    // Fórmula: (Rating Promedio × LOG(Volumen Acuerdos + 1)) + Bonus Antigüedad
    const volumeBonus = Math.log(completedCount + 1);
    const daysSinceCreation = account
      ? (Date.now() - new Date(account.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const seniorityBonus = Math.min(daysSinceCreation / 365, 0.5); // Max 0.5

    const penalties = await prisma.reputationEvent.aggregate({
      where: { userId, type: 'PENALTY_APPLIED' },
      _sum: { value: true },
    });
    const penaltyValue = Math.abs(penalties._sum.value || 0);

    const score = Math.max(0, Math.min(5,
      (avgRating * volumeBonus) + seniorityBonus - penaltyValue
    ));

    await prisma.user.update({
      where: { id: userId },
      data: { reputationScore: Math.round(score * 100) / 100 },
    });

    return score;
  },

  // --------------------------------------------------------------------------
  // CRON: TIMEOUT PENDING_CERTIFICATION > 7 DAYS
  // --------------------------------------------------------------------------

  async transitionStaleCertifications() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.conversation.updateMany({
      where: {
        status: 'PENDING_CERTIFICATION',
        updatedAt: { lt: sevenDaysAgo },
      },
      data: { status: 'ISSUE_REPORTED' },
    });
  },
};
