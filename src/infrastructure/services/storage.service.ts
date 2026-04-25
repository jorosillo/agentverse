/**
 * Servicio de almacenamiento de imágenes via Vercel Blob.
 * Maneja la subida y eliminación de imágenes de agentes y ofertas.
 * Restricciones del MVP:
 * - Máximo 5 imágenes por agente/oferta
 * - Máximo 10MB por imagen
 * - Formatos: png, jpg, jpeg, gif, webp
 */
import { put, del } from '@vercel/blob';

// ============================================================================
// CONSTANTES
// ============================================================================

export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB en bytes
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

// ============================================================================
// FUNCIONES PÚBLICAS
// ============================================================================

/**
 * Sube una imagen al almacenamiento de Vercel Blob.
 * @param file - Archivo a subir.
 * @param folder - Carpeta de organización (ej: 'agents', 'jobs', 'avatars').
 * @returns URL pública de la imagen subida.
 */
export async function uploadImage(
  file: File,
  folder: string
): Promise<string> {
  // Validar tipo
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    throw new Error(`Tipo de imagen no soportado: ${file.type}`);
  }

  // Validar tamaño
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`El archivo excede el límite de ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
  }

  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });

  return blob.url;
}

/**
 * Sube múltiples imágenes en paralelo.
 * @param files - Array de archivos a subir.
 * @param folder - Carpeta de organización.
 * @returns Array de URLs públicas de las imágenes subidas.
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string
): Promise<string[]> {
  if (files.length > MAX_IMAGES) {
    throw new Error(`Máximo ${MAX_IMAGES} imágenes permitidas`);
  }

  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Elimina una imagen del almacenamiento.
 * @param url - URL de la imagen a eliminar.
 */
export async function deleteImage(url: string): Promise<void> {
  await del(url);
}

/**
 * Elimina múltiples imágenes del almacenamiento.
 * @param urls - Array de URLs de imágenes a eliminar.
 */
export async function deleteMultipleImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => deleteImage(url));
  await Promise.all(deletePromises);
}
