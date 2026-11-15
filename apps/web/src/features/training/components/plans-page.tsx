import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/page-title';

import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanList } from './plan-list';
import { PlanSheet } from './plan-sheet';
import { useTrainingTranslation } from '../i18n';

// The Plans screen: a header with the Add action, the plan list (the active plan is
// pinned on top as an expandable row showing its templates and exercises), and the
// create/edit Sheet.
export function PlansPage() {
  const t = useTrainingTranslation();
  const openCreate = usePlanUiStore((s) => s.openCreate);

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:p-4 max-w-6xl lg:col-start-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          {t.plans.title}
        </PageTitle>
        <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          {t.common.add}
        </Button>
      </div>

      <PlanList />
      <PlanSheet />
    </div>
  );
}
