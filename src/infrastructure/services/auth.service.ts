/**
 * Servicio de autenticación JWT.
 * Usa la librería `jose` para firmar/verificar tokens
 * de forma compatible con Edge Runtime de Next.js.
 * Gestiona: generación de tokens, verificación, parsing de cookies.
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { UserRole } from '@prisma/client';

// ============================================================================
// TIPOS
// ============================================================================

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'agentverse-dev-secret-change-in-production'
);

const SESSION_DURATION = '24h';
const REMEMBER_ME_DURATION = '30d';

// ============================================================================
// FUNCIONES PÚBLICAS
// ============================================================================

/**
 * Genera un JWT firmado con los datos de la sesión del usuario.
 * @param payload - Datos del usuario a incluir en el token.
 * @param rememberMe - Si true, extiende la duración del token a 30 días.
 * @returns Token JWT firmado como string.
 */
export async function generateToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  rememberMe: boolean = false
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION)
    .sign(JWT_SECRET);
}

/**
 * Verifica y decodifica un token JWT.
 * @param token - Token JWT a verificar.
 * @returns Payload decodificado si el token es válido, null si no.
 */
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Nombre de la cookie de sesión.
 */
export const SESSION_COOKIE_NAME = 'agentverse_session';
