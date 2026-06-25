import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { create } from 'zustand';

// Local UI state for the calendar: which month is on screen (drives the
// planned-sessions range query) and which day's detail sheet is open
// (null = closed). selectedDate is an ISO yyyy-MM-dd string so it maps
// directly onto planned_sessions.scheduled_date. Server data stays in
// TanStack Query; this store holds only navigation/modal state.
interface CalendarUiState {
  viewedMonth: Date;
  selectedDate: string | null;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectDay: (date: string) => void;
  closeDay: () => void;
}

export const useCalendarUiStore = create<CalendarUiState>((set) => ({
  viewedMonth: startOfMonth(new Date()),
  selectedDate: null,
  goToPrevMonth: () => set((state) => ({ viewedMonth: subMonths(state.viewedMonth, 1) })),
  goToNextMonth: () => set((state) => ({ viewedMonth: addMonths(state.viewedMonth, 1) })),
  goToToday: () => set({ viewedMonth: startOfMonth(new Date()) }),
  selectDay: (date) => set({ selectedDate: date }),
  closeDay: () => set({ selectedDate: null }),
}));
