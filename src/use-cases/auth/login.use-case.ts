/**
 * Use Case: Login de usuario.
 * Fuente: HU-03.
 * 
 * Reglas de negocio:
 * - Verificar credenciales (email + bcrypt compare)
 * - Mensajes genéricos ("Credenciales inválidas") para prevenir user enumeration
 * - Generar JWT con duración según "Recordarme"
 * - Verificar que la cuenta no esté suspendida/baneada
 */
import bcrypt from 'bcryptjs';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import { generateToken } from '@/infrastructure/services/auth.service';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth.schema';
import type { ActionResult } from '@/lib/types';

const GENERIC_ERROR = 'Credenciales inválidas';

interface LoginResult {
  token: string;
  userId: string;
  role: string;
}

export async function loginUseCase(
  input: LoginInput
): Promise<ActionResult<LoginResult>> {
  // 1. Validar input con Zod
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: GENERIC_ERROR };
  }

  const { email, password, rememberMe } = parsed.data;

  // 2. Buscar usuario por email
  const user = await userRepository.findByEmail(email);
  if (!user) {
    // No revelar que el email no existe (anti-enumeración)
    return { success: false, error: GENERIC_ERROR };
  }

  // 3. Verificar estado de la cuenta
  if (user.status === 'SUSPENDED') {
    return { success: false, error: 'Tu cuenta ha sido suspendida temporalmente.' };
  }
  if (user.status === 'BANNED') {
    return { success: false, error: 'Tu cuenta ha sido desactivada.' };
  }

  // 4. Comparar contraseña con hash almacenado
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: GENERIC_ERROR };
  }

  // 5. Generar JWT con duración según "Recordarme"
  const token = await generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    rememberMe
  );

  return {
    success: true,
    data: {
      token,
      userId: user.id,
      role: user.role,
    },
  };
}
