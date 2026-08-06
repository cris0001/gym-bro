import type { ReactNode } from 'react';

// A centered, designed empty state: an optional icon in a muted circle, a title, a
// short description, and an optional action (a button or link). Used where a list or
// page has no data yet, in place of a bare line of text.
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      {icon ? (
        <div className="bg-secondary text-muted-foreground flex size-14 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="font-heading text-lg font-semibold">{title}</p>
        {description ? (
          <p className="text-muted-foreground mx-auto max-w-xs text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
