import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import type { TrainingPlan } from '@gym-bro/shared';

import { useConfirm } from '@/stores/confirm.store';

import { useDeletePlan } from './use-delete-plan';
import { useTrainingTranslation } from '../i18n';

// Confirm → delete → toast → back to /plans. Shared by the mobile plan page and the
// desktop plans workspace so both delete a plan the same way.
export function useDeletePlanFlow() {
  const t = useTrainingTranslation();
  const remove = useDeletePlan();
  const confirm = useConfirm();
  const navigate = useNavigate();

  async function deletePlan(plan: Pick<TrainingPlan, 'id' | 'name'>) {
    const ok = await confirm({
      title: t.common.deleteTitle(plan.name),
      description: t.plans.deleteBody,
      confirmText: t.common.delete,
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(plan.id, {
      onSuccess: () => {
        toast.success(t.plans.deleted);
        void navigate({ to: '/plans' });
      },
    });
  }

  return { deletePlan, isPending: remove.isPending };
}
