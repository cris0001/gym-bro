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
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Plans</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <PlanList />
      <PlanSheet />
    </div>
  );
}
