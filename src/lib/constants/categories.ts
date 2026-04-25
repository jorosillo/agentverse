/**
 * Categorías predefinidas del marketplace.
 * Fuente: AgentVerse.md — Filtros para agentes y ofertas.
 */

export const CATEGORIES = [
  { id: 'chatbot', name: 'Chatbot', slug: 'chatbot' },
  { id: 'data-analysis', name: 'Análisis de Datos', slug: 'data-analysis' },
  { id: 'content-generation', name: 'Generación de Contenido', slug: 'content-generation' },
  { id: 'image-processing', name: 'Procesamiento de Imágenes', slug: 'image-processing' },
  { id: 'nlp', name: 'Procesamiento de Lenguaje Natural', slug: 'nlp' },
  { id: 'automation', name: 'Automatización', slug: 'automation' },
  { id: 'voice-assistant', name: 'Asistente de Voz', slug: 'voice-assistant' },
  { id: 'recommendation', name: 'Sistema de Recomendación', slug: 'recommendation' },
  { id: 'computer-vision', name: 'Visión por Computadora', slug: 'computer-vision' },
  { id: 'predictive-analytics', name: 'Analítica Predictiva', slug: 'predictive-analytics' },
  { id: 'document-processing', name: 'Procesamiento de Documentos', slug: 'document-processing' },
  { id: 'code-assistant', name: 'Asistente de Código', slug: 'code-assistant' },
  { id: 'customer-service', name: 'Servicio al Cliente', slug: 'customer-service' },
  { id: 'other', name: 'Otro', slug: 'other' },
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];
