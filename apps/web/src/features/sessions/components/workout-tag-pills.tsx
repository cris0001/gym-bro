import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

// A finished workout's tags as tinted pills: the tag color at ~15% over the card
// with a darker (light mode) / lighter (dark mode) text of the same hue, plus a dot.
export function WorkoutTagPills({
  tags,
  className,
}: {
  tags: WorkoutSessionDetail['tags'];
  className?: string;
}) {
  if (tags.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold"
          style={{
            backgroundColor: `color-mix(in oklab, ${tag.color} 15%, var(--card))`,
            color: `color-mix(in oklab, ${tag.color} 65%, var(--foreground))`,
          }}
        >
          <span className="size-[7px] rounded-full" style={{ backgroundColor: tag.color }} />
          {tag.name}
        </span>
      ))}
    </div>
  );
}
