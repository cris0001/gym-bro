import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import type { TrainingPlan } from '@gym-bro/shared';

import { useConfirm } from '@/stores/confirm.store';

import { useDeletePlan } from './use-delete-plan';

// Confirm → delete → toast → back to /plans. Shared by the mobile plan page and the
// desktop plans workspace so both delete a plan the same way.
export function useDeletePlanFlow() {
  const remove = useDeletePlan();
  const confirm = useConfirm();
  const navigate = useNavigate();

  async function deletePlan(plan: Pick<TrainingPlan, 'id' | 'name'>) {
    const ok = await confirm({
      title: `Delete "${plan.name}"?`,
      description: 'This also removes all of its templates.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(plan.id, {
      onSuccess: () => {
        toast.success('Plan deleted');
        void navigate({ to: '/plans' });
      },
    });
  }

  return { deletePlan, isPending: remove.isPending };
}
