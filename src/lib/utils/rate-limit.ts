/**
 * Utilidad de Rate Limiting en memoria para entornos Serverless.
 * Fuente: plan.txt Fase 6, HU-44.
 * 
 * Implementación MVP simple basada en Map en memoria.
 * Para producción real se recomienda migrar a Upstash Redis.
 * 
 * Límites configurados en src/lib/constants/config.ts
 */

// ============================================================================
// TIPOS
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp
}

// ============================================================================
// STORE EN MEMORIA
// ============================================================================

const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpieza periódica para evitar memory leaks
// MVP: cada 60 segundos eliminamos entradas expiradas
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60_000);
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Verifica si un identificador ha excedido el límite de peticiones.
 * @param identifier - Clave única (userId, IP, etc).
 * @param maxRequests - Número máximo de peticiones permitidas.
 * @param windowMs - Ventana de tiempo en milisegundos.
 * @returns Objeto con allowed (boolean) y remaining (peticiones restantes).
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // Si no hay entrada o la ventana ha expirado, crear nueva
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Si aún está dentro de la ventana, incrementar
  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// ============================================================================
// HELPERS PRECONFIGURADOS
// ============================================================================

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MINUTE_MS = 60 * 1000;

/**
 * Rate limit para envío de mensajes: 10/hora/usuario.
 */
export function checkMessageRateLimit(userId: string) {
  return checkRateLimit(`msg:${userId}`, 10, HOUR_MS);
}

/**
 * Rate limit para creación de agentes/ofertas: 5/día/usuario.
 */
export function checkCreationRateLimit(userId: string) {
  return checkRateLimit(`create:${userId}`, 5, DAY_MS);
}

/**
 * Rate limit para intentos de login: 5/minuto/IP.
 */
export function checkLoginRateLimit(ip: string) {
  return checkRateLimit(`login:${ip}`, 5, MINUTE_MS);
}
