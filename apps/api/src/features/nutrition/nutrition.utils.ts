import { createHash } from 'node:crypto';

// Uploaded food / recipe photos are stored in image_url as a data-URI (a small WebP
// resized on the client). Responses never carry those bytes: they point at the image
// endpoint instead, so lists stay small and the browser caches each photo by URL.
// Any other value (an OpenFoodFacts http URL) is passed through untouched.

export type ImageOwner = 'foods' | 'recipes';

const DATA_URI = /^data:([\w/+.-]+);base64,(.+)$/s;

// The URL a stored image is served at. `v` is a short hash of the image itself, so it
// only changes when the photo does — the endpoint can then be cached as immutable.
export function toImageRef(owner: ImageOwner, id: string, stored: string | null): string | null {
  if (!stored?.startsWith('data:')) return stored;
  const version = createHash('md5').update(stored).digest('hex').slice(0, 10);
  return `/api/${owner}/${id}/image?v=${version}`;
}

// True when a client sends back the ref it was given for this same row — i.e. "keep
// the current photo", not a new image to store.
export function isOwnImageRef(owner: ImageOwner, id: string, value: string): boolean {
  return value.startsWith(`/api/${owner}/${id}/image`);
}

// The bytes + content type of a stored data-URI, or null for anything else.
export function decodeDataUri(stored: string): { contentType: string; bytes: Buffer } | null {
  const match = DATA_URI.exec(stored);
  if (!match?.[1] || !match[2]) return null;
  return { contentType: match[1], bytes: Buffer.from(match[2], 'base64') };
}
