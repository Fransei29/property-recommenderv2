/**
 * Achica fotos en el navegador antes de subirlas (las de celular suelen pesar varios MB)
 */
const MAX_SIDE = 1920;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) {
      return file;
    }
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch (error) {
    console.error('No se pudo comprimir la imagen, se sube la original:', error);
    return file;
  }
}

export function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
