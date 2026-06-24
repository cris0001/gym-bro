import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanForm } from './plan-form';

// Bottom sheet hosting the create/edit form. Open state and the target row come
// from the UI store. The form is keyed by the editing id so it remounts with
// fresh defaults each time the sheet opens for a different plan.
export function PlanSheet() {
  const open = usePlanUiStore((s) => s.open);
  const editing = usePlanUiStore((s) => s.editing);
  const close = usePlanUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit plan' : 'New plan'}</SheetTitle>
          <SheetDescription>
            {editing ? 'Update the name or description.' : 'Create a training plan.'}
          </SheetDescription>
        </SheetHeader>

        <PlanForm key={editing?.id ?? 'new'} editing={editing} onSuccess={close} />
      </SheetContent>
    </Sheet>
  );
}
