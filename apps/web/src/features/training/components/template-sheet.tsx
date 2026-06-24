import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useTemplateUiStore } from '../stores/template-ui.store';
import { TemplateForm } from './template-form';

// Bottom sheet hosting the create/edit form. Open state, the target row, and
// the parent plan come from the UI store. The form is keyed by the editing id
// so it remounts with fresh defaults each time the sheet opens.
export function TemplateSheet() {
  const open = useTemplateUiStore((s) => s.open);
  const editing = useTemplateUiStore((s) => s.editing);
  const planId = useTemplateUiStore((s) => s.planId);
  const close = useTemplateUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit template' : 'New template'}</SheetTitle>
          <SheetDescription>
            {editing ? 'Update the name or description.' : 'Add a workout day to this plan.'}
          </SheetDescription>
        </SheetHeader>

        <TemplateForm
          key={editing?.id ?? 'new'}
          editing={editing}
          planId={planId}
          onSuccess={close}
        />
      </SheetContent>
    </Sheet>
  );
}
