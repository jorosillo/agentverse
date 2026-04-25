/**
 * Singleton de PrismaClient para entorno serverless.
 * Evita la creación de múltiples instancias en hot-reload de desarrollo.
 * NUNCA importar directamente en componentes de React ni en Server Actions.
 * Solo accesible desde src/infrastructure/repositories/*.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
