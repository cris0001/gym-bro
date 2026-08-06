import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanList } from './plan-list';
import { PlanSheet } from './plan-sheet';

// The Plans screen: a header with the Add action, the plan list (the active plan is
// pinned on top as an expandable row showing its templates and exercises), and the
// create/edit Sheet.
export function PlansPage() {
  const openCreate = usePlanUiStore((s) => s.openCreate);

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-4xl flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[28px] leading-none font-medium">Plans</h1>
        <Button type="button" className="h-11 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <PlanList />
      <PlanSheet />
    </div>
  );
}
