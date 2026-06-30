import { addMonths, addWeeks, subMonths, subWeeks } from 'date-fns';
import { create } from 'zustand';

// Local UI state for the calendar: the view mode (month grid vs single week), the
// anchor date whose month/week is on screen (drives the range query), and which
// day's detail is open (null = closed). selectedDate is an ISO yyyy-mm-dd string
// so it maps onto planned_sessions.scheduled_date. Server data stays in TanStack
// Query; this store holds only navigation state.
export type CalendarViewMode = 'month' | 'week';

interface CalendarUiState {
  viewMode: CalendarViewMode;
  anchor: Date;
  selectedDate: string | null;
  setViewMode: (mode: CalendarViewMode) => void;
  goPrev: () => void;
  goNext: () => void;
  goToToday: () => void;
  selectDay: (date: string) => void;
  closeDay: () => void;
}

export const useCalendarUiStore = create<CalendarUiState>((set) => ({
  viewMode: 'month',
  anchor: new Date(),
  selectedDate: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  // Prev/next step by the unit of the current view.
  goPrev: () =>
    set((state) => ({
      anchor: state.viewMode === 'month' ? subMonths(state.anchor, 1) : subWeeks(state.anchor, 1),
    })),
  goNext: () =>
    set((state) => ({
      anchor: state.viewMode === 'month' ? addMonths(state.anchor, 1) : addWeeks(state.anchor, 1),
    })),
  goToToday: () => set({ anchor: new Date() }),
  selectDay: (date) => set({ selectedDate: date }),
  closeDay: () => set({ selectedDate: null }),
}));
