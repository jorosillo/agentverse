/**
 * Test Suite: Validación de Schemas Zod.
 * Tests de validación isomórfica para los schemas críticos.
 */
import { describe, it, expect } from 'vitest';
import { createJobSchema, jobFiltersSchema } from '@/lib/schemas/job.schema';
import { createReviewSchema } from '@/lib/schemas/review.schema';
import { startConversationSchema, sendMessageSchema, acceptProposalSchema, updateConversationStatusSchema } from '@/lib/schemas/message.schema';

// ============================================================================
// JOB SCHEMA
// ============================================================================

describe('createJobSchema', () => {
  it('acepta datos válidos', () => {
    const result = createJobSchema.safeParse({
      name: 'Agente IA para Soporte',
      shortDescription: 'Buscamos agente de soporte automatizado',
      longDescription: 'Necesitamos un agente de IA capaz de gestionar consultas de clientes de primer nivel, con integración en nuestro CRM existente.',
      categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
      technologies: ['Python', 'LangChain'],
      paymentType: 'FIXED',
      budget: 3000,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza nombre muy corto (<3 chars)', () => {
    const result = createJobSchema.safeParse({
      name: 'AI',
      shortDescription: 'Descripción corta válida',
      longDescription: 'a'.repeat(50),
      categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
      technologies: ['Python'],
      paymentType: 'FIXED',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre muy largo (>100 chars)', () => {
    const result = createJobSchema.safeParse({
      name: 'a'.repeat(101),
      shortDescription: 'Descripción válida',
      longDescription: 'a'.repeat(50),
      categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
      technologies: ['Python'],
      paymentType: 'FIXED',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza sin tecnologías', () => {
    const result = createJobSchema.safeParse({
      name: 'Job Válido',
      shortDescription: 'Descripción válida',
      longDescription: 'a'.repeat(50),
      categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
      technologies: [],
      paymentType: 'FIXED',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza paymentType inválido', () => {
    const result = createJobSchema.safeParse({
      name: 'Job Válido',
      shortDescription: 'Descripción válida',
      longDescription: 'a'.repeat(50),
      categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
      technologies: ['Python'],
      paymentType: 'YEARLY',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CONVERSATION SCHEMAS
// ============================================================================

describe('startConversationSchema', () => {
  it('acepta con agentId', () => {
    const result = startConversationSchema.safeParse({
      recipientId: '550e8400-e29b-41d4-a716-446655440000',
      agentId: '550e8400-e29b-41d4-a716-446655440001',
      initialMessage: 'Hola, me interesa tu agente para automatizar soporte',
    });
    expect(result.success).toBe(true);
  });

  it('acepta con jobId', () => {
    const result = startConversationSchema.safeParse({
      recipientId: '550e8400-e29b-41d4-a716-446655440000',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
      initialMessage: 'Me postulo a esta oferta con mi agente',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza sin agentId NI jobId (debe vincular a uno)', () => {
    const result = startConversationSchema.safeParse({
      recipientId: '550e8400-e29b-41d4-a716-446655440000',
      initialMessage: 'Mensaje huérfano sin recurso',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza con AMBOS agentId Y jobId (exclusión mutua)', () => {
    const result = startConversationSchema.safeParse({
      recipientId: '550e8400-e29b-41d4-a716-446655440000',
      agentId: '550e8400-e29b-41d4-a716-446655440001',
      jobId: '550e8400-e29b-41d4-a716-446655440002',
      initialMessage: 'No debería aceptar ambos recursos',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza mensaje muy corto (<10 chars)', () => {
    const result = startConversationSchema.safeParse({
      recipientId: '550e8400-e29b-41d4-a716-446655440000',
      agentId: '550e8400-e29b-41d4-a716-446655440001',
      initialMessage: 'Hola',
    });
    expect(result.success).toBe(false);
  });
});

describe('sendMessageSchema', () => {
  it('acepta mensaje válido', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Mensaje de prueba',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza mensaje vacío', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza mensaje >5000 chars', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      content: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe('acceptProposalSchema', () => {
  it('acepta importe positivo', () => {
    const result = acceptProposalSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      agreedPrice: 1500,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza importe negativo', () => {
    const result = acceptProposalSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      agreedPrice: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza importe cero', () => {
    const result = acceptProposalSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      agreedPrice: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateConversationStatusSchema', () => {
  it('acepta acción "complete"', () => {
    const r = updateConversationStatusSchema.safeParse({ conversationId: '550e8400-e29b-41d4-a716-446655440000', action: 'complete' });
    expect(r.success).toBe(true);
  });
  it('acepta acción "certify"', () => {
    const r = updateConversationStatusSchema.safeParse({ conversationId: '550e8400-e29b-41d4-a716-446655440000', action: 'certify' });
    expect(r.success).toBe(true);
  });
  it('acepta acción "cancel"', () => {
    const r = updateConversationStatusSchema.safeParse({ conversationId: '550e8400-e29b-41d4-a716-446655440000', action: 'cancel' });
    expect(r.success).toBe(true);
  });
  it('rechaza acción inválida', () => {
    const r = updateConversationStatusSchema.safeParse({ conversationId: '550e8400-e29b-41d4-a716-446655440000', action: 'invalid' });
    expect(r.success).toBe(false);
  });
});

// ============================================================================
// REVIEW SCHEMA
// ============================================================================

describe('createReviewSchema', () => {
  it('acepta review válida con comentario', () => {
    const result = createReviewSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      professionalRating: 5,
      fulfillmentRating: 4,
      communicationRating: 5,
      comment: 'Excelente trabajo profesional',
    });
    expect(result.success).toBe(true);
  });

  it('acepta review sin comentario', () => {
    const result = createReviewSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      professionalRating: 3,
      fulfillmentRating: 4,
      communicationRating: 3,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza rating fuera de rango (>5)', () => {
    const result = createReviewSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      professionalRating: 6,
      fulfillmentRating: 4,
      communicationRating: 3,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza rating fuera de rango (<1)', () => {
    const result = createReviewSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      professionalRating: 0,
      fulfillmentRating: 4,
      communicationRating: 3,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza comentario demasiado largo (>2000)', () => {
    const result = createReviewSchema.safeParse({
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      professionalRating: 5,
      fulfillmentRating: 5,
      communicationRating: 5,
      comment: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// JOB FILTERS
// ============================================================================

describe('jobFiltersSchema', () => {
  it('aplica defaults correctos', () => {
    const result = jobFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.sortBy).toBe('recent');
    }
  });

  it('acepta filtros completos', () => {
    const result = jobFiltersSchema.safeParse({
      page: 2,
      limit: 20,
      search: 'python',
      paymentType: 'HOURLY',
      sortBy: 'highestBudget',
      industry: 'TECHNOLOGY',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza limit > 50', () => {
    const result = jobFiltersSchema.safeParse({ limit: 100 });
    expect(result.success).toBe(false);
  });
});
