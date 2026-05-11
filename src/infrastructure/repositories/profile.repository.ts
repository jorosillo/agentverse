/**
 * Repositorio de perfiles — Capa de acceso a datos.
 * Gestiona DeveloperProfile y CompanyProfile + métricas de dashboard.
 */
import { prisma } from '@/infrastructure/database/prisma';
import type { Prisma } from '@prisma/client';

export const profileRepository = {
  // --------------------------------------------------------------------------
  // DEVELOPER PROFILE
  // --------------------------------------------------------------------------

  async updateDeveloperProfile(
    userId: string,
    data: Prisma.DeveloperProfileUpdateInput
  ) {
    return prisma.developerProfile.update({
      where: { userId },
      data,
    });
  },

  // --------------------------------------------------------------------------
  // COMPANY PROFILE
  // --------------------------------------------------------------------------

  async updateCompanyProfile(
    userId: string,
    data: Prisma.CompanyProfileUpdateInput
  ) {
    return prisma.companyProfile.update({
      where: { userId },
      data,
    });
  },

  // --------------------------------------------------------------------------
  // AVATAR
  // --------------------------------------------------------------------------

  async updateAvatar(userId: string, avatarUrl: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  },

  // --------------------------------------------------------------------------
  // ONBOARDING
  // --------------------------------------------------------------------------

  async completeOnboarding(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
  },

  async updateEmailPreferences(userId: string, emailPreferences: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailPreferences },
    });
  },

  // --------------------------------------------------------------------------
  // DASHBOARD METRICS — DEVELOPER
  // --------------------------------------------------------------------------

  async getDeveloperDashboardStats(userId: string) {
    const [agentsCount, totalViews, acceptedDeals, completedDeals, user, recentAgents] =
      await Promise.all([
        // Total de agentes publicados
        prisma.agent.count({ where: { authorId: userId, isActive: true } }),

        // Total de visualizaciones de todos los agentes
        prisma.agent.aggregate({
          where: { authorId: userId },
          _sum: { viewCount: true },
        }),

        // Ofertas aceptadas (conversaciones IN_PROGRESS+)
        prisma.conversation.count({
          where: {
            OR: [{ participantAId: userId }, { participantBId: userId }],
            status: { in: ['IN_PROGRESS', 'PENDING_CERTIFICATION', 'COMPLETED'] },
          },
        }),

        // Acuerdos completados
        prisma.conversation.count({
          where: {
            OR: [{ participantAId: userId }, { participantBId: userId }],
            status: 'COMPLETED',
          },
        }),

        // Rating oficial (Reputation Score unificado)
        prisma.user.findUnique({
          where: { id: userId },
          select: { reputationScore: true },
        }),

        // Top 5 agentes recientes
        prisma.agent.findMany({
          where: { authorId: userId, isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            shortDescription: true,
            viewCount: true,
            createdAt: true,
          },
        }),
      ]);

    const overallRating = user?.reputationScore ?? 0;

    return {
      agentsCount,
      totalViews: totalViews._sum.viewCount ?? 0,
      acceptedDeals,
      completedDeals,
      overallRating,
      recentAgents,
    };
  },

  // --------------------------------------------------------------------------
  // DASHBOARD METRICS — COMPANY
  // --------------------------------------------------------------------------

  async getCompanyDashboardStats(userId: string) {
    const [jobsCount, totalViews, agentsHired, applications, user, recentJobs] =
      await Promise.all([
        // Total de ofertas publicadas
        prisma.job.count({ where: { ownerCompanyId: userId, isActive: true } }),

        // Total de visualizaciones de todas las ofertas
        prisma.job.aggregate({
          where: { ownerCompanyId: userId },
          _sum: { viewCount: true },
        }),

        // Agentes contratados (acuerdos completados)
        prisma.conversation.count({
          where: {
            OR: [{ participantAId: userId }, { participantBId: userId }],
            status: 'COMPLETED',
          },
        }),

        // Postulaciones (conversaciones PENDING)
        prisma.conversation.count({
          where: {
            OR: [{ participantAId: userId }, { participantBId: userId }],
            status: 'PENDING',
          },
        }),

        // Rating oficial (Reputation Score unificado)
        prisma.user.findUnique({
          where: { id: userId },
          select: { reputationScore: true },
        }),

        // Top 5 ofertas recientes
        prisma.job.findMany({
          where: { ownerCompanyId: userId, isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            shortDescription: true,
            viewCount: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    const overallRating = user?.reputationScore ?? 0;

    return {
      jobsCount,
      totalViews: totalViews._sum.viewCount ?? 0,
      agentsHired,
      applications,
      overallRating,
      recentJobs,
    };
  },

  // --------------------------------------------------------------------------
  // PERFIL PÚBLICO
  // --------------------------------------------------------------------------

  async getPublicProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        avatarUrl: true,
        reputationScore: true,
        createdAt: true,
        developerProfile: {
          select: {
            fullName: true,
            region: true,
            githubUrl: true,
            skills: true,
            experienceLevel: true,
            bio: true,
          },
        },
        companyProfile: {
          select: {
            companyName: true,
            industry: true,
            size: true,
            website: true,
            description: true,
          },
        },
        reviewsReceived: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            reviewer: {
              select: {
                id: true,
                role: true,
                avatarUrl: true,
                developerProfile: { select: { fullName: true } },
                companyProfile: { select: { companyName: true } },
              },
            },
          },
        },
        _count: {
          select: {
            agents: true,
            jobs: true,
            reviewsReceived: true,
          },
        },
      },
    });
  },
};
