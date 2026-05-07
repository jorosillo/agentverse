/**
 * Utilidad para rastrear vistas de elementos (ofertas, agentes, perfiles)
 * y evitar "farming" (múltiples recargas de página que inflen los contadores).
 * 
 * Implementación MVP en memoria. En producción se recomienda migrar a Redis (Upstash).
 */

const viewStore = new Map<string, number>();

// Limpieza periódica para evitar memory leaks (cada hora)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of viewStore.entries()) {
      if (now - timestamp > 3600000) { // Expirar después de 1 hora
        viewStore.delete(key);
      }
    }
  }, 3600000);
}

/**
 * Verifica si se debe incrementar el contador de vistas para un recurso.
 * Registra la vista en memoria si no ha sido visitado recientemente.
 * 
 * @param identifier Clave única que identifica la vista (ej: "job_123_user_456")
 * @param windowMs Ventana de tiempo de enfriamiento (por defecto 1 hora)
 * @returns true si es la primera vista en la ventana de tiempo (se debe incrementar)
 */
export function shouldIncrementView(identifier: string, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const lastView = viewStore.get(identifier);

  // Si no hay registro previo o ya expiró la ventana de tiempo
  if (!lastView || now - lastView > windowMs) {
    viewStore.set(identifier, now);
    return true;
  }

  // Ya fue visto recientemente por este identificador
  return false;
}
