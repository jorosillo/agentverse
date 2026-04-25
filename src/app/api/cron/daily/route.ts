/**
 * CRON Job API Route — Ejecutado diariamente.
 * 1. Transiciona PENDING_CERTIFICATION > 7 días → ISSUE_REPORTED.
 * 2. Recalcula reputación de todos los usuarios.
 * Protegido por CRON_SECRET para evitar acceso externo.
 */
import { NextRequest, NextResponse } from 'next/server';
import { moderationRepository } from '@/infrastructure/repositories/moderation.repository';
import { prisma } from '@/infrastructure/database/prisma';

export async function GET(request: NextRequest) {
  // Verificar CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Transicionar certificaciones expiradas
    const staleResult = await moderationRepository.transitionStaleCertifications();

    // 2. Recalcular reputación de todos los usuarios activos
    const users = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    let reputationUpdated = 0;
    for (const user of users) {
      await moderationRepository.recalculateReputation(user.id);
      reputationUpdated++;
    }

    return NextResponse.json({
      success: true,
      staleCertifications: staleResult.count,
      reputationUpdated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del CRON job' },
      { status: 500 }
    );
  }
}
