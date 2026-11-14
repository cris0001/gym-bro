import { useState } from 'react';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { BodyMeasurement } from '@gym-bro/shared';

import { useDeleteBodyMeasurement } from '../hooks/use-delete-body-measurement';
import { useBodyTranslation } from '../i18n';

// A history row's delete, confirmed in a popover (no modal for a single row).
export function MeasurementDeleteButton({ entry }: { entry: BodyMeasurement }) {
  const t = useBodyTranslation();
  const remove = useDeleteBodyMeasurement();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <DeleteIconButton aria-label={t.history.deleteAria(entry.measuredDate)} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60">
        <p className="text-sm font-medium">{t.history.deleteTitle}</p>
        <p className="text-muted-foreground text-sm">{t.history.deleteBody}</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-border bg-field px-[18px] text-[13px] font-semibold"
            onClick={() => setOpen(false)}
          >
            {t.history.cancel}
          </Button>
          {/* This popover is the confirm step, so it gets the solid delete fill. */}
          <Button
            type="button"
            size="sm"
            className="bg-destructive-solid text-destructive-solid-foreground hover:bg-destructive-solid-hover rounded-full px-[18px] text-[13px] font-semibold"
            disabled={remove.isPending}
            onClick={() => remove.mutate(entry.id, { onSuccess: () => setOpen(false) })}
          >
            {t.history.delete}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
