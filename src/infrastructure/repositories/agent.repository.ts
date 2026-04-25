/**
 * Repositorio de Agentes — Capa de acceso a datos.
 * CRUD completo + catálogo paginado con filtros.
 * NO aplica anti-scraping aquí. La sanitización se hace en el use-case/action.
 */
import { prisma } from '@/infrastructure/database/prisma';
import type { Prisma } from '@prisma/client';
import type { AgentFiltersInput } from '@/lib/schemas/agent.schema';

export const agentRepository = {
  // --------------------------------------------------------------------------
  // CRUD
  // --------------------------------------------------------------------------

  async create(data: {
    authorId: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    technologies: string[];
    paymentType: 'FIXED' | 'MONTHLY' | 'HOURLY';
    price?: number | null;
    images: string[];
    categoryIds: string[];
  }) {
    return prisma.agent.create({
      data: {
        authorId: data.authorId,
        name: data.name,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        technologies: data.technologies,
        paymentType: data.paymentType,
        price: data.price ?? null,
        images: data.images,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: {
        categories: { include: { category: true } },
        author: {
          select: {
            id: true,
            developerProfile: { select: { fullName: true, region: true } },
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.agent.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        author: {
          select: {
            id: true,
            avatarUrl: true,
            reputationScore: true,
            developerProfile: {
              select: { fullName: true, region: true, skills: true, experienceLevel: true },
            },
          },
        },
      },
    });
  },

  async update(
    id: string,
    data: Prisma.AgentUpdateInput,
    categoryIds?: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      if (categoryIds) {
        await tx.agentCategoryRelation.deleteMany({ where: { agentId: id } });
        await tx.agentCategoryRelation.createMany({
          data: categoryIds.map((categoryId) => ({ agentId: id, categoryId })),
        });
      }

      return tx.agent.update({
        where: { id },
        data,
        include: {
          categories: { include: { category: true } },
          author: {
            select: {
              id: true,
              developerProfile: { select: { fullName: true, region: true } },
            },
          },
        },
      });
    });
  },

  async softDelete(id: string) {
    return prisma.agent.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async incrementViews(id: string) {
    return prisma.agent.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  // --------------------------------------------------------------------------
  // CATÁLOGO PAGINADO CON FILTROS
  // --------------------------------------------------------------------------

  async findMany(filters: AgentFiltersInput) {
    const where: Prisma.AgentWhereInput = { isActive: true };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { shortDescription: { contains: filters.search, mode: 'insensitive' } },
        { technologies: { hasSome: [filters.search] } },
      ];
    }

    if (filters.categoryId) {
      where.categories = { some: { categoryId: filters.categoryId } };
    }

    if (filters.paymentType) {
      where.paymentType = filters.paymentType;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceFilter: Prisma.FloatNullableFilter = {};
      if (filters.minPrice !== undefined) priceFilter.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceFilter.lte = filters.maxPrice;
      where.price = priceFilter;
    }

    if (filters.technologies && filters.technologies.length > 0) {
      where.technologies = { hasSome: filters.technologies };
    }

    let orderBy: Prisma.AgentOrderByWithRelationInput;
    switch (filters.sortBy) {
      case 'mostViewed':
        orderBy = { viewCount: 'desc' };
        break;
      case 'rating':
        orderBy = { author: { reputationScore: 'desc' } };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categories: { include: { category: true } },
          author: {
            select: {
              id: true,
              avatarUrl: true,
              reputationScore: true,
              developerProfile: { select: { fullName: true, region: true } },
            },
          },
        },
      }),
      prisma.agent.count({ where }),
    ]);

    return {
      data: agents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  // --------------------------------------------------------------------------
  // MIS AGENTES
  // --------------------------------------------------------------------------

  async findByAuthor(authorId: string) {
    return prisma.agent.findMany({
      where: { authorId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: { include: { category: true } },
        _count: { select: { conversations: true } },
      },
    });
  },

  async countByAuthorToday(authorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.agent.count({
      where: { authorId, createdAt: { gte: today } },
    });
  },
};
