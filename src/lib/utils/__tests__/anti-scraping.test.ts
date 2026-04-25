/**
 * Test Suite: Anti-Scraping Sanitization.
 * Fuente: plan.txt Fase 7, HU-23, HU-30.
 * 
 * Valida exhaustivamente que:
 * - Un DEVELOPER NO recibe price/paymentType/author de agentes ajenos.
 * - Un COMPANY NO recibe budget/ownerCompany de jobs ajenos.
 * - El propietario del recurso SÍ recibe todos los datos.
 * - Los filtros de precio están restringidos por rol.
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeAgentForRole,
  sanitizeAgentsForRole,
  sanitizeJobForRole,
  sanitizeJobsForRole,
  canFilterByPrice,
} from '@/lib/utils/anti-scraping';

// ============================================================================
// FIXTURES
// ============================================================================

const mockAgent = {
  id: 'agent-1',
  authorId: 'dev-author-1',
  name: 'AI Assistant Pro',
  shortDescription: 'Agente de asistencia',
  price: 99.99,
  paymentType: 'FIXED' as const,
  author: { id: 'dev-author-1', fullName: 'Dev Author' },
  technologies: ['Python', 'LangChain'],
};

const mockJob = {
  id: 'job-1',
  ownerCompanyId: 'company-owner-1',
  name: 'Agente para Soporte',
  shortDescription: 'Buscamos agente IA',
  budget: 5000,
  paymentType: 'MONTHLY' as const,
  ownerCompany: { id: 'company-owner-1', companyName: 'TechCorp' },
  technologies: ['Node.js'],
};

// ============================================================================
// AGENT ANTI-SCRAPING
// ============================================================================

describe('sanitizeAgentForRole', () => {
  it('DEVELOPER viendo agente ajeno → price, paymentType, author = null', () => {
    const result = sanitizeAgentForRole(mockAgent, {
      userRole: 'DEVELOPER',
      userId: 'another-dev-id',
    });

    expect(result.price).toBeNull();
    expect(result.paymentType).toBeNull();
    expect(result.author).toBeNull();
    expect(result.authorId).toBeNull();
    // Datos no sensibles se mantienen
    expect(result.name).toBe('AI Assistant Pro');
    expect(result.technologies).toEqual(['Python', 'LangChain']);
  });

  it('DEVELOPER viendo su propio agente → datos completos', () => {
    const result = sanitizeAgentForRole(mockAgent, {
      userRole: 'DEVELOPER',
      userId: 'dev-author-1', // Same as authorId
    });

    expect(result.price).toBe(99.99);
    expect(result.paymentType).toBe('FIXED');
    expect(result.author).toEqual({ id: 'dev-author-1', fullName: 'Dev Author' });
    expect(result.authorId).toBe('dev-author-1');
  });

  it('COMPANY viendo cualquier agente → datos completos (no se oculta)', () => {
    const result = sanitizeAgentForRole(mockAgent, {
      userRole: 'COMPANY',
      userId: 'company-viewer-1',
    });

    expect(result.price).toBe(99.99);
    expect(result.paymentType).toBe('FIXED');
    expect(result.author).toEqual({ id: 'dev-author-1', fullName: 'Dev Author' });
  });
});

describe('sanitizeAgentsForRole (lista)', () => {
  it('Sanitiza TODOS los agentes ajenos en la lista', () => {
    const agents = [
      { ...mockAgent, id: 'a-1', authorId: 'dev-1' },
      { ...mockAgent, id: 'a-2', authorId: 'dev-2' },
      { ...mockAgent, id: 'a-3', authorId: 'current-dev' }, // own
    ];

    const results = sanitizeAgentsForRole(agents, {
      userRole: 'DEVELOPER',
      userId: 'current-dev',
    });

    // Ajenos → sanitizados
    expect(results[0].price).toBeNull();
    expect(results[1].price).toBeNull();
    // Propio → datos completos
    expect(results[2].price).toBe(99.99);
  });
});

// ============================================================================
// JOB ANTI-SCRAPING
// ============================================================================

describe('sanitizeJobForRole', () => {
  it('COMPANY viendo job ajeno → budget, ownerCompany = null', () => {
    const result = sanitizeJobForRole(mockJob, {
      userRole: 'COMPANY',
      userId: 'another-company-id',
    });

    expect(result.budget).toBeNull();
    expect(result.paymentType).toBeNull();
    expect(result.ownerCompany).toBeNull();
    expect(result.ownerCompanyId).toBeNull();
    // Datos no sensibles se mantienen
    expect(result.name).toBe('Agente para Soporte');
    expect(result.technologies).toEqual(['Node.js']);
  });

  it('COMPANY viendo su propio job → datos completos', () => {
    const result = sanitizeJobForRole(mockJob, {
      userRole: 'COMPANY',
      userId: 'company-owner-1', // Same as ownerCompanyId
    });

    expect(result.budget).toBe(5000);
    expect(result.paymentType).toBe('MONTHLY');
    expect(result.ownerCompany).toEqual({ id: 'company-owner-1', companyName: 'TechCorp' });
  });

  it('DEVELOPER viendo cualquier job → datos completos (no se oculta)', () => {
    const result = sanitizeJobForRole(mockJob, {
      userRole: 'DEVELOPER',
      userId: 'dev-viewer-1',
    });

    expect(result.budget).toBe(5000);
    expect(result.paymentType).toBe('MONTHLY');
    expect(result.ownerCompany).toEqual({ id: 'company-owner-1', companyName: 'TechCorp' });
  });
});

describe('sanitizeJobsForRole (lista)', () => {
  it('Sanitiza TODOS los jobs ajenos en la lista', () => {
    const jobs = [
      { ...mockJob, id: 'j-1', ownerCompanyId: 'c-1' },
      { ...mockJob, id: 'j-2', ownerCompanyId: 'current-company' }, // own
    ];

    const results = sanitizeJobsForRole(jobs, {
      userRole: 'COMPANY',
      userId: 'current-company',
    });

    expect(results[0].budget).toBeNull(); // ajeno
    expect(results[1].budget).toBe(5000); // propio
  });
});

// ============================================================================
// FILTROS DE PRECIO
// ============================================================================

describe('canFilterByPrice', () => {
  it('DEVELOPER NO puede filtrar agentes por precio', () => {
    expect(canFilterByPrice('DEVELOPER', 'agent')).toBe(false);
  });

  it('DEVELOPER SÍ puede filtrar jobs por presupuesto', () => {
    expect(canFilterByPrice('DEVELOPER', 'job')).toBe(true);
  });

  it('COMPANY SÍ puede filtrar agentes por precio', () => {
    expect(canFilterByPrice('COMPANY', 'agent')).toBe(true);
  });

  it('COMPANY NO puede filtrar jobs por presupuesto', () => {
    expect(canFilterByPrice('COMPANY', 'job')).toBe(false);
  });
});
