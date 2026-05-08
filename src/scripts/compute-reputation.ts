/**
 * Script: Recalcular la reputación de todos los usuarios.
 * Ejecutar con: npx tsx src/scripts/compute-reputation.ts
 */
import { prisma } from '../infrastructure/database/prisma';
import { moderationRepository } from '../infrastructure/repositories/moderation.repository';

async function main() {
  console.log('🚀 Iniciando recalculo de reputación...');
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  });
  
  console.log(`Encontrados ${users.length} usuarios.`);
  
  for (const user of users) {
    try {
      const score = await moderationRepository.recalculateReputation(user.id);
      console.log(`✅ [${user.email}] Nuevo score: ${score.toFixed(2)}`);
    } catch (error) {
      console.error(`❌ Error con usuario ${user.email}:`, error);
    }
  }
  
  console.log('🎉 Recalculo finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
