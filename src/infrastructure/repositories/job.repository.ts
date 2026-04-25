/**
 * Repositorio de Ofertas de Trabajo — Capa de acceso a datos.
 * CRUD completo + catálogo paginado con filtros.
 * NO aplica anti-scraping aquí. La sanitización se hace en el use-case/action.
 */
import { prisma } from '@/infrastructure/database/prisma';
import type { Prisma } from '@prisma/client';
import type { JobFiltersInput } from '@/lib/schemas/job.schema';

export const jobRepository = {
  // --------------------------------------------------------------------------
  // CRUD
  // --------------------------------------------------------------------------

  async create(data: {
    ownerCompanyId: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    technologies: string[];
    paymentType: 'FIXED' | 'MONTHLY' | 'HOURLY';
    budget?: number | null;
    images: string[];
    categoryIds: string[];
  }) {
    return prisma.job.create({
      data: {
        ownerCompanyId: data.ownerCompanyId,
        name: data.name,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        technologies: data.technologies,
        paymentType: data.paymentType,
        budget: data.budget ?? null,
        images: data.images,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: {
        categories: { include: { category: true } },
        ownerCompany: {
          select: {
            id: true,
            companyProfile: { select: { companyName: true, industry: true } },
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        ownerCompany: {
          select: {
            id: true,
            avatarUrl: true,
            reputationScore: true,
            companyProfile: {
              select: { companyName: true, industry: true, size: true, website: true },
            },
          },
        },
      },
    });
  },

  async update(
    id: string,
    data: Prisma.JobUpdateInput,
    categoryIds?: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      if (categoryIds) {
        await tx.jobCategoryRelation.deleteMany({ where: { jobId: id } });
        await tx.jobCategoryRelation.createMany({
          data: categoryIds.map((categoryId) => ({ jobId: id, categoryId })),
        });
      }

      return tx.job.update({
        where: { id },
        data,
        include: {
          categories: { include: { category: true } },
          ownerCompany: {
            select: {
              id: true,
              companyProfile: { select: { companyName: true, industry: true } },
            },
          },
        },
      });
    });
  },

  async softDelete(id: string) {
    return prisma.job.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async incrementViews(id: string) {
    return prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  // --------------------------------------------------------------------------
  // CATÁLOGO PAGINADO CON FILTROS
  // --------------------------------------------------------------------------

  async findMany(filters: JobFiltersInput) {
    const where: Prisma.JobWhereInput = { isActive: true, status: 'OPEN' };

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

    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
      const budgetFilter: Prisma.FloatNullableFilter = {};
      if (filters.minBudget !== undefined) budgetFilter.gte = filters.minBudget;
      if (filters.maxBudget !== undefined) budgetFilter.lte = filters.maxBudget;
      where.budget = budgetFilter;
    }

    if (filters.technologies && filters.technologies.length > 0) {
      where.technologies = { hasSome: filters.technologies };
    }

    // Filtrar por industria de la empresa propietaria
    if (filters.industry) {
      where.ownerCompany = {
        companyProfile: { industry: filters.industry },
      };
    }

    // Filtrar por tamaño de empresa
    if (filters.companySize) {
      where.ownerCompany = {
        ...(where.ownerCompany as Prisma.UserWhereInput || {}),
        companyProfile: {
          ...((where.ownerCompany as Prisma.UserWhereInput)?.companyProfile as Prisma.CompanyProfileWhereInput || {}),
          size: filters.companySize,
        },
      };
    }

    let orderBy: Prisma.JobOrderByWithRelationInput;
    switch (filters.sortBy) {
      case 'mostViewed':
        orderBy = { viewCount: 'desc' };
        break;
      case 'rating':
        orderBy = { ownerCompany: { reputationScore: 'desc' } };
        break;
      case 'highestBudget':
        orderBy = { budget: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categories: { include: { category: true } },
          ownerCompany: {
            select: {
              id: true,
              avatarUrl: true,
              reputationScore: true,
              companyProfile: { select: { companyName: true, industry: true, size: true } },
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  // --------------------------------------------------------------------------
  // MIS OFERTAS
  // --------------------------------------------------------------------------

  async findByOwner(ownerCompanyId: string) {
    return prisma.job.findMany({
      where: { ownerCompanyId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: { include: { category: true } },
        _count: { select: { conversations: true } },
      },
    });
  },

  async countByOwnerToday(ownerCompanyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.job.count({
      where: { ownerCompanyId, createdAt: { gte: today } },
    });
  },
};
