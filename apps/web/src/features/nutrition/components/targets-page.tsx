import { useState } from 'react';

import type { NutritionTarget } from '@gym-bro/shared';

import { useCurrentTarget } from '../hooks/use-current-target';
import { useNutritionTranslation } from '../i18n';
import { TargetsForm } from './targets-form';
import { TargetsHistory } from './targets-history';

const CARD = 'rounded-[20px] border border-border bg-card p-5 md:p-6';

// Targets settings: set the current daily target or back-fill/edit a dated entry,
// and review the history of past targets. Editing state is owned here and shared by
// the form (seeds it) and the history (its edit buttons set it).
export function TargetsPage() {
  const t = useNutritionTranslation();
  const { data: current, isPending } = useCurrentTarget();
  const [editing, setEditing] = useState<NutritionTarget | null>(null);

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-5xl flex-col gap-4 p-3 md:p-4">
      <h1 className="font-heading text-[28px] leading-none font-medium lg:text-[30px]">
        {t.targets.title}
      </h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <section className={CARD}>
          <h2 className="font-heading mb-4 text-[20px] font-semibold">
            {editing ? t.targets.editTarget : t.targets.dailyTarget}
          </h2>
          {isPending ? (
            <p className="text-muted-foreground text-sm">{t.common.loading}</p>
          ) : (
            <TargetsForm
              key={editing?.id ?? current?.id ?? 'none'}
              current={current ?? null}
              editing={editing}
              onDone={() => setEditing(null)}
            />
          )}
        </section>

        <section className={CARD}>
          <h2 className="font-heading mb-2 text-[20px] font-semibold">{t.targets.history}</h2>
          <TargetsHistory onEdit={setEditing} />
        </section>
      </div>
    </div>
  );
}
