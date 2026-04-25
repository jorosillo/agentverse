/**
 * Use Case: Eliminación de cuenta (GDPR – HU-13).
 * 
 * Reglas:
 * - Requiere confirmación exacta "ELIMINAR MI CUENTA"
 * - Cascade delete en Prisma eliminará todos los datos asociados
 */
import { userRepository } from '@/infrastructure/repositories/user.repository';
import { deleteAccountSchema, type DeleteAccountInput } from '@/lib/schemas/profile.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function deleteAccountUseCase(
  session: SessionUser,
  input: DeleteAccountInput
): Promise<ActionResult> {
  // 1. Validar confirmación
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Confirmación inválida' };
  }

  // 2. Eliminar usuario (cascade delete en Prisma)
  await userRepository.delete(session.userId);

  return { success: true, data: undefined };
}
