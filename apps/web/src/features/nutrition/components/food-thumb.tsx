import { Apple, ChefHat } from 'lucide-react';

import { cn } from '@/lib/utils';

// A food's or recipe's square thumbnail: its photo, or — when it has none (most generic
// catalog foods, custom entries) — a muted tile with an apple / chef's hat, so rows
// keep the same left edge whether or not a photo exists. Size comes from className.
export function FoodThumb({
  imageUrl,
  kind = 'food',
  className,
}: {
  imageUrl: string | null | undefined;
  kind?: 'food' | 'recipe';
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn('bg-muted border-border shrink-0 rounded-lg border object-cover', className)}
      />
    );
  }
  const Icon = kind === 'recipe' ? ChefHat : Apple;
  return (
    <span
      aria-hidden
      className={cn(
        'bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-lg',
        className,
      )}
    >
      <Icon className="size-[45%]" />
    </span>
  );
}
