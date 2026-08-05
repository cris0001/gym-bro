// Downscale a picked image and return it as a WebP data-URI. Done entirely on the
// client (canvas) so uploads stay light and the server needs no image processing. A
// 512px WebP at 0.8 quality is ~20–60 KB — sharp enough to actually recognise the
// product, and comfortably under the 200 KB image_url cap in the shared schema.
export async function resizeImageToDataUrl(
  file: File,
  maxSize = 512,
  quality = 0.8,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported');
    ctx.drawImage(bitmap, 0, 0, width, height);

    // WebP where supported; browsers that don't know it fall back to PNG silently.
    return canvas.toDataURL('image/webp', quality);
  } finally {
    bitmap.close();
  }
}
