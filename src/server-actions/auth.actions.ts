/**
 * Server Actions para autenticación.
 * Capa de exposición que conecta UI con use-cases de auth.
 * Gestiona cookies JWT HttpOnly (stateless).
 * 
 * Fase 1: Registro, Login, Logout, Verificación, Reset.
 */
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@/infrastructure/services/auth.service';
import { registerDeveloperUseCase, registerCompanyUseCase } from '@/use-cases/auth/register.use-case';
import { loginUseCase } from '@/use-cases/auth/login.use-case';
import { verifyEmailUseCase } from '@/use-cases/auth/verify-email.use-case';
import { forgotPasswordUseCase } from '@/use-cases/auth/forgot-password.use-case';
import { resetPasswordUseCase } from '@/use-cases/auth/reset-password.use-case';
import { getSessionUseCase, getSessionWithProfileUseCase } from '@/use-cases/auth/get-session.use-case';
import type { RegisterDeveloperInput, RegisterCompanyInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@/lib/schemas/auth.schema';
import type { ActionResult, SessionUser, UserWithProfile } from '@/lib/types';
import { checkLoginRateLimit } from '@/lib/utils/rate-limit';

// ============================================================================
// HELPERS INTERNOS
// ============================================================================

/**
 * Establece la cookie de sesión JWT HttpOnly.
 */
async function setSessionCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30d o 24h
  });
}

/**
 * Elimina la cookie de sesión.
 */
async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ============================================================================
// REGISTRO (HU-01, HU-02)
// ============================================================================

/**
 * Registra un nuevo usuario con rol DEVELOPER.
 */
export async function registerDeveloper(
  input: RegisterDeveloperInput
): Promise<ActionResult<{ userId: string }>> {
  try {
    const result = await registerDeveloperUseCase(input);

    if (!result.success) {
      return result;
    }

    // Establecer cookie de sesión
    await setSessionCookie(result.data.token);

    return {
      success: true,
      data: { userId: result.data.userId },
    };
  } catch (error) {
    console.error('Error en registro developer:', error);
    return { success: false, error: 'Error interno del servidor. Inténtalo de nuevo.' };
  }
}

/**
 * Registra un nuevo usuario con rol COMPANY.
 */
export async function registerCompany(
  input: RegisterCompanyInput
): Promise<ActionResult<{ userId: string }>> {
  try {
    const result = await registerCompanyUseCase(input);

    if (!result.success) {
      return result;
    }

    await setSessionCookie(result.data.token);

    return {
      success: true,
      data: { userId: result.data.userId },
    };
  } catch (error) {
    console.error('Error en registro company:', error);
    return { success: false, error: 'Error interno del servidor. Inténtalo de nuevo.' };
  }
}

// ============================================================================
// LOGIN (HU-03)
// ============================================================================

/**
 * Inicia sesión de un usuario existente.
 */
export async function login(
  input: LoginInput
): Promise<ActionResult<{ userId: string; role: string }>> {
  try {
    // Rate limiting por IP (sería más robusto con IP real, para MVP usamos email)
    const rateCheck = checkLoginRateLimit(input.email);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Demasiados intentos. Por favor espera antes de intentarlo de nuevo.',
      };
    }

    const result = await loginUseCase(input);

    if (!result.success) {
      return result;
    }

    await setSessionCookie(result.data.token, input.rememberMe);

    return {
      success: true,
      data: { userId: result.data.userId, role: result.data.role },
    };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: 'Error interno del servidor. Inténtalo de nuevo.' };
  }
}

// ============================================================================
// LOGOUT (HU-04)
// ============================================================================

/**
 * Cierra la sesión del usuario (limpia cookie + redirige a landing).
 */
export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect('/');
}

// ============================================================================
// VERIFICACIÓN DE EMAIL (HU-06)
// ============================================================================

/**
 * Verifica el correo electrónico del usuario mediante token.
 */
export async function verifyEmail(
  token: string
): Promise<ActionResult<{ userId: string }>> {
  try {
    return await verifyEmailUseCase(token);
  } catch (error) {
    console.error('Error en verificación de email:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}

// ============================================================================
// RECUPERACIÓN DE CONTRASEÑA (HU-05)
// ============================================================================

/**
 * Solicita un enlace de restablecimiento de contraseña.
 */
export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<ActionResult> {
  try {
    return await forgotPasswordUseCase(input);
  } catch (error) {
    console.error('Error en forgot password:', error);
    // Siempre devolver éxito (anti-enumeración)
    return { success: true, data: undefined };
  }
}

/**
 * Restablece la contraseña con un token válido.
 */
export async function resetPassword(
  input: ResetPasswordInput
): Promise<ActionResult> {
  try {
    return await resetPasswordUseCase(input);
  } catch (error) {
    console.error('Error en reset password:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}

// ============================================================================
// SESIÓN (Helper para Server Components)
// ============================================================================

/**
 * Obtiene la sesión actual del usuario (para Server Components).
 */
export async function getCurrentSession(): Promise<SessionUser | null> {
  return getSessionUseCase();
}

/**
 * Obtiene la sesión con perfil completo (para Server Components).
 */
export async function getCurrentSessionWithProfile(): Promise<UserWithProfile | null> {
  return getSessionWithProfileUseCase();
}
