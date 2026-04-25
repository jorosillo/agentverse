/**
 * Configuración global de la aplicación.
 */

export const APP_CONFIG = {
  name: 'AgentVerse',
  description: 'El marketplace para Agentes de IA',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Rate Limiting (plan.txt Fase 6)
  rateLimits: {
    messagesPerHour: 10,           // Máximo 10 mensajes/hora/usuario
    creationsPerDay: 5,            // Máximo 5 agentes u ofertas/día
    loginAttemptsPerMinute: 5,     // Máximo 5 intentos login/min
    registerAttemptsPerMinute: 5,  // Máximo 5 registros/min por IP
  },

  // Tiempos de expiración
  tokens: {
    emailVerificationHours: 24,     // 24h para verificar email
    passwordResetMinutes: 30,       // 30min para resetear contraseña
    sessionHours: 24,               // 24h sesión estándar
    rememberMeDays: 30,             // 30 días con "Recordarme"
  },

  // Límites de contenido
  content: {
    maxImagesPerEntity: 5,
    maxImageSizeMB: 10,
    maxNameLength: 100,
    maxShortDescLength: 100,
    maxLongDescLength: 10000,
    maxMessageLength: 5000,
    maxCommentLength: 2000,
  },

  // Inactividad para ISSUE_REPORTED (plan.txt Fase 6)
  agreement: {
    certificationTimeoutDays: 7,
    penaltyThresholdDays: 15,
  },

  // Contacto de disputas
  disputes: {
    email: 'disputas@agentverse.com',
  },
} as const;
