import { RotateCw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

// A centered, designed error state with an optional retry. Used where a query fails,
// in place of a bare red line of text. `onRetry` typically wires to the query's
// refetch.
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center" role="alert">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <TriangleAlert className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {message ? (
          <p className="text-muted-foreground mx-auto max-w-xs text-sm">{message}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
          <RotateCw className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
