/**
 * Repositorio de usuarios — Capa de acceso a datos.
 * ÚNICA capa autorizada para invocar PrismaClient sobre la tabla users.
 * 
 * Fase 1: CRUD completo + tokens de verificación y reset.
 */
import { prisma } from '@/infrastructure/database/prisma';
import type { User, ExperienceLevel, Industry, CompanySize } from '@prisma/client';
import crypto from 'crypto';

// ============================================================================
// TIPOS INTERNOS DEL REPOSITORIO
// ============================================================================

interface CreateDeveloperData {
  email: string;
  passwordHash: string;
  fullName: string;
  region: string;
  githubUrl?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  emailPreferences: boolean;
}

interface CreateCompanyData {
  email: string;
  passwordHash: string;
  companyName: string;
  industry: Industry;
  size: CompanySize;
  website?: string;
  emailPreferences: boolean;
}

// ============================================================================
// REPOSITORIO
// ============================================================================

export const userRepository = {
  // --------------------------------------------------------------------------
  // CONSULTAS
  // --------------------------------------------------------------------------

  /**
   * Encuentra un usuario por su email.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        developerProfile: true,
        companyProfile: true,
      },
    });
  },

  /**
   * Encuentra un usuario por su ID.
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Encuentra un usuario por su ID con perfiles incluidos.
   */
  async findByIdWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        developerProfile: true,
        companyProfile: true,
      },
    });
  },

  // --------------------------------------------------------------------------
  // CREACIÓN
  // --------------------------------------------------------------------------

  /**
   * Crea un usuario con rol DEVELOPER y su perfil asociado.
   * Operación transaccional (ACID): user + profile + token de verificación.
   */
  async createDeveloper(data: CreateDeveloperData) {
    const verificationToken = crypto.randomUUID();

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: 'DEVELOPER',
          emailPreferences: data.emailPreferences,
          developerProfile: {
            create: {
              fullName: data.fullName,
              region: data.region,
              githubUrl: data.githubUrl || null,
              skills: data.skills,
              experienceLevel: data.experienceLevel,
            },
          },
          emailVerificationTokens: {
            create: {
              token: verificationToken,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
            },
          },
        },
        include: {
          developerProfile: true,
          companyProfile: true,
        },
      });

      return { user, verificationToken };
    });
  },

  /**
   * Crea un usuario con rol COMPANY y su perfil asociado.
   * Operación transaccional (ACID): user + profile + token de verificación.
   */
  async createCompany(data: CreateCompanyData) {
    const verificationToken = crypto.randomUUID();

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: 'COMPANY',
          emailPreferences: data.emailPreferences,
          companyProfile: {
            create: {
              companyName: data.companyName,
              industry: data.industry,
              size: data.size,
              website: data.website || null,
            },
          },
          emailVerificationTokens: {
            create: {
              token: verificationToken,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
            },
          },
        },
        include: {
          developerProfile: true,
          companyProfile: true,
        },
      });

      return { user, verificationToken };
    });
  },

  // --------------------------------------------------------------------------
  // ACTUALIZACIÓN
  // --------------------------------------------------------------------------

  /**
   * Marca un usuario como email verificado.
   */
  async updateEmailVerified(userId: string, verified: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: verified },
    });
  },

  /**
   * Actualiza la contraseña de un usuario.
   */
  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  /**
   * Actualiza el score de reputación de un usuario.
   */
  async updateReputationScore(userId: string, score: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { reputationScore: score },
    });
  },

  // --------------------------------------------------------------------------
  // ELIMINACIÓN (GDPR – HU-13)
  // --------------------------------------------------------------------------

  /**
   * Elimina un usuario y todos sus datos (cascade definido en schema).
   */
  async delete(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  },

  // --------------------------------------------------------------------------
  // TOKENS DE VERIFICACIÓN DE EMAIL
  // --------------------------------------------------------------------------

  /**
   * Busca un token de verificación de email válido (no usado, no expirado).
   */
  async findValidEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  /**
   * Marca un token de verificación como usado.
   */
  async consumeEmailVerificationToken(tokenId: string) {
    return prisma.emailVerificationToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  },

  // --------------------------------------------------------------------------
  // TOKENS DE RESET DE CONTRASEÑA
  // --------------------------------------------------------------------------

  /**
   * Crea un token de restablecimiento de contraseña (30 min de validez).
   */
  async createPasswordResetToken(userId: string) {
    const token = crypto.randomUUID();

    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      },
    });
  },

  /**
   * Busca un token de reset válido (no usado, no expirado).
   */
  async findValidPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  /**
   * Marca un token de reset como usado.
   */
  async consumePasswordResetToken(tokenId: string) {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  },
};
