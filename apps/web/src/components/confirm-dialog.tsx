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
          <AlertDialogCancel
            className={cn(
              request?.destructive &&
                'h-10 rounded-full border-[#e8e1da] bg-[#fdfbf9] px-[18px] text-[13px] font-semibold dark:border-[#2f292d] dark:bg-[#171316]',
            )}
            onClick={() => resolve(false)}
          >
            {request?.cancelText ?? 'Cancel'}
          </AlertDialogCancel>
          {/* The only place a delete gets the solid red fill. */}
          <AlertDialogAction
            className={cn(
              request?.destructive &&
                'bg-destructive-solid text-destructive-solid-foreground hover:bg-destructive-solid-hover h-10 rounded-full px-[18px] text-[13px] font-semibold transition-colors duration-150',
            )}
            onClick={() => resolve(true)}
          >
            {request?.confirmText ?? 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
