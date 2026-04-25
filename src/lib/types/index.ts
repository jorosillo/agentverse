/**
 * Tipos derivados de Prisma y tipos auxiliares 
 * para usar a lo largo de la aplicación.
 * Single Source of Truth: los tipos base emanan de @prisma/client.
 */
import type {
  User,
  DeveloperProfile,
  CompanyProfile,
  Agent,
  Job,
  Conversation,
  Message,
  ReviewFeedback,
  UserRole,
  ConversationStatus,
} from '@prisma/client';

// ============================================================================
// TIPOS DE USUARIO CON PERFILES
// ============================================================================

/** Usuario con perfil de desarrollador incluido. */
export type UserWithDeveloperProfile = User & {
  developerProfile: DeveloperProfile | null;
};

/** Usuario con perfil de empresa incluido. */
export type UserWithCompanyProfile = User & {
  companyProfile: CompanyProfile | null;
};

/** Usuario con perfil completo (uno de los dos). */
export type UserWithProfile = User & {
  developerProfile: DeveloperProfile | null;
  companyProfile: CompanyProfile | null;
};

// ============================================================================
// TIPOS DE SESIÓN
// ============================================================================

/** Datos de sesión del usuario actual. */
export interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

// ============================================================================
// TIPOS DE AGENTE (CON ANTI-SCRAPING INCLUIDO)
// ============================================================================

/** Agente con datos del autor (visible solo para COMPANY o el propio autor). */
export type AgentWithAuthor = Agent & {
  author: {
    id: string;
    developerProfile: {
      fullName: string;
      region: string;
    } | null;
  } | null;
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
};

/** Agente sanitizado (datos sensibles pueden ser null). */
export type SanitizedAgent = Omit<AgentWithAuthor, 'price' | 'paymentType' | 'author' | 'authorId'> & {
  price: number | null;
  paymentType: string | null;
  author: AgentWithAuthor['author'] | null;
  authorId: string | null;
};

// ============================================================================
// TIPOS DE JOB (CON ANTI-SCRAPING INCLUIDO)
// ============================================================================

/** Job con datos de la empresa (visible solo para DEVELOPER o el propio owner). */
export type JobWithCompany = Job & {
  ownerCompany: {
    id: string;
    companyProfile: {
      companyName: string;
      industry: string;
    } | null;
  } | null;
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
};

/** Job sanitizado (datos sensibles pueden ser null). */
export type SanitizedJob = Omit<JobWithCompany, 'budget' | 'ownerCompany' | 'ownerCompanyId'> & {
  budget: number | null;
  ownerCompany: JobWithCompany['ownerCompany'] | null;
  ownerCompanyId: string | null;
};

// ============================================================================
// TIPOS DE CONVERSACIÓN
// ============================================================================

/** Conversación con último mensaje y datos de participantes. */
export type ConversationWithDetails = Conversation & {
  participantA: {
    id: string;
    avatarUrl: string | null;
    developerProfile: { fullName: string } | null;
    companyProfile: { companyName: string } | null;
  };
  participantB: {
    id: string;
    avatarUrl: string | null;
    developerProfile: { fullName: string } | null;
    companyProfile: { companyName: string } | null;
  };
  messages: Message[];
  agent: { id: string; name: string } | null;
  job: { id: string; name: string } | null;
};

// ============================================================================
// TIPOS DE RESPUESTA PAGINADA
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// TIPOS DE RESULTADO DE ACCIONES
// ============================================================================

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Re-exports para conveniencia
export type {
  User,
  DeveloperProfile,
  CompanyProfile,
  Agent,
  Job,
  Conversation,
  Message,
  ReviewFeedback,
  UserRole,
  ConversationStatus,
};
