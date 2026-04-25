/**
 * Industrias y tamaños de empresa predefinidos.
 * Fuente: AgentVerse.md — Registro de Empresa (HU-02).
 */

export const INDUSTRIES = {
  TECHNOLOGY: 'Tecnología',
  FINANCE: 'Finanzas',
  HEALTH: 'Salud',
  EDUCATION: 'Educación',
  RETAIL: 'Retail',
  OTHER: 'Otro',
} as const;

export const COMPANY_SIZES = {
  SIZE_1_10: '1-10 empleados',
  SIZE_11_50: '11-50 empleados',
  SIZE_51_200: '51-200 empleados',
  SIZE_201_500: '201-500 empleados',
  SIZE_500: '500+ empleados',
} as const;

export const EXPERIENCE_LEVELS = {
  YEARS_1_2: '1-2 años',
  YEARS_2_4: '2-4 años',
  YEARS_4_6: '4-6 años',
  YEARS_6_10: '6-10 años',
  YEARS_10: '10+ años',
} as const;

export const PAYMENT_TYPES = {
  FIXED: 'Fijo',
  MONTHLY: 'Por mes',
  HOURLY: 'Por hora',
} as const;

export const CONVERSATION_STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  PENDING_CERTIFICATION: 'Pendiente de certificación',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  ISSUE_REPORTED: 'Incidencia',
} as const;

export const REPORT_CATEGORY_LABELS = {
  FRAUD: 'Fraude',
  SPAM: 'Spam',
  COPYRIGHT: 'Derechos de autor',
  OFFENSIVE: 'Conducta inapropiada',
  OTHER: 'Otro',
} as const;

/**
 * Skills técnicas sugeridas para el selector de registro de Developer.
 */
export const SUGGESTED_SKILLS = [
  'Python',
  'LangChain',
  'OpenAI API',
  'TypeScript',
  'TensorFlow',
  'PyTorch',
  'Hugging Face',
  'RAG',
  'LLM Fine-tuning',
  'Computer Vision',
  'NLP',
  'Prompt Engineering',
  'AutoGPT',
  'CrewAI',
  'LangGraph',
  'Anthropic API',
  'Vector Databases',
  'Embeddings',
  'Stable Diffusion',
  'Whisper',
] as const;
