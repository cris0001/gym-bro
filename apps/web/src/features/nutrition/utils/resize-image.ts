// Downscale a picked image to a tiny square-ish thumbnail and return it as a WebP
// data-URI. Done entirely on the client (canvas) so uploads stay light and the server
// needs no image processing — a ~96px WebP is a couple of KB, small enough to store
// inline as the food's image_url.
export async function resizeImageToDataUrl(
  file: File,
  maxSize = 96,
  quality = 0.7,
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
