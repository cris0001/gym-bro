import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useConfirmStore } from '@/stores/confirm.store';

// The single global confirm dialog, mounted once at the app root. Reads the pending
// request from the confirm store and settles its promise on action. Rendering is
// driven entirely by `confirm(...)` calls — nothing else mounts this.
export function ConfirmDialog() {
  const request = useConfirmStore((s) => s.request);
  const resolve = useConfirmStore((s) => s.resolve);

  return (
    <AlertDialog
      open={request !== null}
      onOpenChange={(open) => {
        // A dismiss (Esc / overlay) resolves as "not confirmed".
        if (!open) resolve(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-lg">{request?.title}</AlertDialogTitle>
          {request?.description ? (
            <AlertDialogDescription>{request.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => resolve(false)}>
            {request?.cancelText ?? 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(request?.destructive && buttonVariants({ variant: 'destructive' }))}
            onClick={() => resolve(true)}
          >
            {request?.confirmText ?? 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
