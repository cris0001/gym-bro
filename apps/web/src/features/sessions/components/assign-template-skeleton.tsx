import { Skeleton } from '@/components/ui/skeleton';

// The assign form's body while the plans, the chosen plan and its templates load —
// one placeholder in the template rows' shape, so the form doesn't step through
// "no plans" → "no templates" → the list as each request lands.
export function AssignTemplateSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col">
      {[0, 1, 2].map((i) => (
        <li key={i} className={i > 0 ? 'border-border border-t' : undefined}>
          <div className="my-1 flex min-h-11 items-center gap-3 px-2 py-2">
            <Skeleton className="h-3.5 w-3 shrink-0" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
