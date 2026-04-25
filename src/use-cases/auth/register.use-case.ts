/**
 * Use Case: Registro de usuario (Developer o Company).
 * Fuente: HU-01, HU-02.
 * 
 * Reglas de negocio:
 * - Verificar que el email no esté en uso
 * - Hash de contraseña con bcrypt
 * - Crear usuario + perfil + token de verificación en transacción ACID
 * - Enviar email de verificación via Resend (async, no bloquea)
 * - Generar JWT de sesión
 */
import bcrypt from 'bcryptjs';
import { userRepository } from '@/infrastructure/repositories/user.repository';
import { sendVerificationEmail } from '@/infrastructure/services/email.service';
import { generateToken } from '@/infrastructure/services/auth.service';
import {
  registerDeveloperSchema,
  registerCompanySchema,
  type RegisterDeveloperInput,
  type RegisterCompanyInput,
} from '@/lib/schemas/auth.schema';
import type { ActionResult } from '@/lib/types';

const BCRYPT_SALT_ROUNDS = 12;

// ============================================================================
// REGISTRO DE DEVELOPER (HU-01)
// ============================================================================

interface RegisterResult {
  token: string;
  userId: string;
}

export async function registerDeveloperUseCase(
  input: RegisterDeveloperInput
): Promise<ActionResult<RegisterResult>> {
  // 1. Validar input con Zod
  const parsed = registerDeveloperSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const data = parsed.data;

  // 2. Verificar email no duplicado
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    // Mensaje genérico para prevenir enumeración de usuarios (HU-03 criterio 2)
    return { success: false, error: 'No se pudo completar el registro. Verifica tus datos.' };
  }

  // 3. Hash de la contraseña con bcrypt
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

  // 4. Crear usuario + perfil + token de verificación en transacción
  const { user, verificationToken } = await userRepository.createDeveloper({
    email: data.email,
    passwordHash,
    fullName: data.fullName,
    region: data.region,
    githubUrl: data.githubUrl || undefined,
    skills: data.skills,
    experienceLevel: data.experienceLevel,
    emailPreferences: data.emailPreferences ?? true,
  });

  // 5. Enviar email de verificación (no bloquea la respuesta)
  sendVerificationEmail(user.email, verificationToken).catch((err) => {
    console.error('Error enviando email de verificación:', err);
  });

  // 6. Generar JWT de sesión
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: false,
  });

  return {
    success: true,
    data: { token, userId: user.id },
  };
}

// ============================================================================
// REGISTRO DE COMPANY (HU-02)
// ============================================================================

export async function registerCompanyUseCase(
  input: RegisterCompanyInput
): Promise<ActionResult<RegisterResult>> {
  // 1. Validar input con Zod
  const parsed = registerCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const data = parsed.data;

  // 2. Verificar email no duplicado
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    return { success: false, error: 'No se pudo completar el registro. Verifica tus datos.' };
  }

  // 3. Hash de la contraseña
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

  // 4. Crear usuario + perfil + token de verificación
  const { user, verificationToken } = await userRepository.createCompany({
    email: data.email,
    passwordHash,
    companyName: data.companyName,
    industry: data.industry,
    size: data.size,
    website: data.website || undefined,
    emailPreferences: data.emailPreferences ?? true,
  });

  // 5. Enviar email de verificación
  sendVerificationEmail(user.email, verificationToken).catch((err) => {
    console.error('Error enviando email de verificación:', err);
  });

  // 6. Generar JWT
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: false,
  });

  return {
    success: true,
    data: { token, userId: user.id },
  };
}
