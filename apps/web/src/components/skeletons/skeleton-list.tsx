import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Loading placeholder for a list of rows (foods, diary, activities, plans…): an optional
// photo slot (38×38 by default; avatarClassName resizes it to match a list's real
// thumbnail), two text lines (60% / 40%), and a trailing action block, separated by the
// same dashed rules as the real lists. Rows are static, so an index key is fine.
export function SkeletonList({
  rows = 5,
  avatar = true,
  avatarClassName,
}: {
  rows?: number;
  avatar?: boolean;
  avatarClassName?: string;
}) {
  return (
    <ul className="divide-y divide-dashed divide-border-strong">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          {avatar ? (
            <Skeleton className={cn('size-[38px] shrink-0 rounded-[10px]', avatarClassName)} />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-2 w-2/5" />
          </div>
          <Skeleton className="size-7 shrink-0" />
        </li>
      ))}
    </ul>
  );
}
