import { Camera, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

// Camera with a small sparkle badge in the top-right corner, marking the photo action
// as an AI estimate rather than a plain photo upload.
export function AiCameraIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <Camera className="size-5" />
      <Sparkles className="absolute -top-1.5 -right-1.5 size-3 fill-current" strokeWidth={2.25} />
    </span>
  );
}
