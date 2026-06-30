import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanList } from './plan-list';
import { PlanSheet } from './plan-sheet';

// The Plans screen: a header with the Add action, the list, and the create/edit
// Sheet (which reads its own open state from the UI store).
export function PlansPage() {
  const openCreate = usePlanUiStore((s) => s.openCreate);

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-4xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Plans</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="bg-card overflow-hidden rounded-xl border">
        <PlanList />
      </div>
      <PlanSheet />
    </div>
  );
}
