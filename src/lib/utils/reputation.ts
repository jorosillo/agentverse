/**
 * Fórmula de cálculo de reputación progresiva.
 * Fuente: plan.txt Fase 6, HU-40.
 * 
 * Fórmula: Reputación = (Rating Promedio × LOG(Volumen Acuerdos + 1)) + Bonus Antigüedad - Penalizaciones
 * 
 * Diseñada para:
 * - Cuentas nuevas NO puedan alcanzar reputación alta rápidamente
 * - El volumen de acuerdos tenga efecto logarítmico (rendimientos decrecientes)
 * - La antigüedad dé un bonus progresivo
 * - Las penalizaciones resten directamente del score
 */

// ============================================================================
// TIPOS
// ============================================================================

interface ReputationInput {
  averageRating: number;         // Promedio de las 3 rúbricas (1-5)
  totalAgreements: number;       // Nº de acuerdos completados
  cancelledAgreements: number;   // Nº de acuerdos cancelados
  accountAgeInDays: number;      // Días desde creación de la cuenta
  totalPenalties: number;        // Suma de valores de penalizaciones
  isEmailVerified: boolean;      // Bonus por verificación
  hasGithub: boolean;            // Bonus por GitHub enlazado (solo devs)
}

// ============================================================================
// CONSTANTES DE LA FÓRMULA
// ============================================================================

const SENIORITY_BONUS_PER_MONTH = 0.1;  // Bonus por cada mes de antigüedad
const MAX_SENIORITY_BONUS = 5;          // Tope de bonus por antigüedad
const VERIFICATION_BONUS = 1;            // Bonus por email verificado
const GITHUB_BONUS = 0.5;               // Bonus por GitHub enlazado
const CANCELLATION_PENALTY_WEIGHT = 2;   // Peso de cada cancelación

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Calcula el score de reputación de un usuario.
 * @returns Score numérico (normalmente 0-100, sin tope duro).
 */
export function calculateReputationScore(input: ReputationInput): number {
  const {
    averageRating,
    totalAgreements,
    cancelledAgreements,
    accountAgeInDays,
    totalPenalties,
    isEmailVerified,
    hasGithub,
  } = input;

  // Componente base: Rating × Log(Volumen + 1)
  const volumeComponent = averageRating * Math.log(totalAgreements + 1);

  // Bonus por antigüedad (máximo 5 puntos)
  const monthsActive = Math.floor(accountAgeInDays / 30);
  const seniorityBonus = Math.min(
    monthsActive * SENIORITY_BONUS_PER_MONTH,
    MAX_SENIORITY_BONUS
  );

  // Bonus por verificación
  const verificationBonus = isEmailVerified ? VERIFICATION_BONUS : 0;
  const githubBonus = hasGithub ? GITHUB_BONUS : 0;

  // Penalizaciones
  const cancellationPenalty = cancelledAgreements * CANCELLATION_PENALTY_WEIGHT;
  const totalPenaltyScore = totalPenalties + cancellationPenalty;

  // Fórmula final
  const score =
    volumeComponent +
    seniorityBonus +
    verificationBonus +
    githubBonus -
    totalPenaltyScore;

  // Score mínimo es 0
  return Math.max(0, Math.round(score * 100) / 100);
}
