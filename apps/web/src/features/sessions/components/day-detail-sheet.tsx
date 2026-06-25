import { format, parseISO } from 'date-fns';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useCalendarUiStore } from '../stores/calendar-ui.store';
import { DayDetail } from './day-detail';

// Mobile presentation of a tapped calendar day: a bottom sheet hosting the
// shared DayDetail body. Open state is the store's selectedDate. On large
// screens the same body is shown inline (see DayDetailPanel) instead.
export function DayDetailSheet() {
  const selectedDate = useCalendarUiStore((s) => s.selectedDate);
  const closeDay = useCalendarUiStore((s) => s.closeDay);

  return (
    <Sheet open={selectedDate !== null} onOpenChange={(next) => !next && closeDay()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>
            {selectedDate ? format(parseISO(selectedDate), 'EEEE, MMM d') : ''}
          </SheetTitle>
          <SheetDescription>Sessions planned for this day.</SheetDescription>
        </SheetHeader>

        {selectedDate && <DayDetail date={selectedDate} />}
      </SheetContent>
    </Sheet>
  );
}
