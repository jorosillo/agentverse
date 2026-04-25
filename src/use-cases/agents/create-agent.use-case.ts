/**
 * Use Case: Crear un nuevo Agente de IA.
 * Fuente: HU-17. Solo DEVELOPER con email verificado.
 * Rate limit: máx 5 agentes/día (plan.txt Fase 6).
 */
import { agentRepository } from '@/infrastructure/repositories/agent.repository';
import { createAgentSchema, type CreateAgentInput } from '@/lib/schemas/agent.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

const MAX_AGENTS_PER_DAY = 5;

export async function createAgentUseCase(
  session: SessionUser,
  input: CreateAgentInput,
  imageUrls: string[]
): Promise<ActionResult<{ agentId: string }>> {
  // 1. RBAC
  if (session.role !== 'DEVELOPER') {
    return { success: false, error: 'Solo los desarrolladores pueden publicar agentes.' };
  }

  // 2. Email verification (rule four.md — operaciones mutativas)
  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  // 3. Validar payload
  const parsed = createAgentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  // 4. Rate limit (máx 5 agentes/día)
  const todayCount = await agentRepository.countByAuthorToday(session.userId);
  if (todayCount >= MAX_AGENTS_PER_DAY) {
    return { success: false, error: `Has alcanzado el límite de ${MAX_AGENTS_PER_DAY} agentes por día.` };
  }

  // 5. Validar imágenes
  if (imageUrls.length > 5) {
    return { success: false, error: 'Máximo 5 imágenes por agente.' };
  }

  // 6. Crear agente
  const agent = await agentRepository.create({
    authorId: session.userId,
    name: parsed.data.name,
    shortDescription: parsed.data.shortDescription,
    longDescription: parsed.data.longDescription,
    technologies: parsed.data.technologies,
    paymentType: parsed.data.paymentType,
    price: parsed.data.price,
    images: imageUrls,
    categoryIds: parsed.data.categoryIds,
  });

  return { success: true, data: { agentId: agent.id } };
}
