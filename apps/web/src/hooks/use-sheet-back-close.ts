import { useEffect, useRef } from 'react';

// Makes the phone/browser Back button (and the Android back gesture) CLOSE an open
// sheet instead of navigating to another URL.
//
// When a controlled sheet opens we push a throwaway history entry with the SAME URL.
// Back then pops that entry — we catch the popstate and close the sheet, and because
// the URL never changed the router stays put. If the sheet is closed via the UI (X /
// Done / overlay), we remove the throwaway entry so history stays clean and the next
// Back goes where the user expects.
//
// `onOpenChange` is read through a ref so an inline handler (new identity each render)
// doesn't retrigger the effect; only `open` drives it. No-ops for uncontrolled sheets
// (no `open`/`onOpenChange`). Single sheet at a time is the assumption here.
export function useSheetBackClose(
  open: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!open || !onOpenChangeRef.current) return;

    // Duplicate the current history entry (same URL + router state) so Back has
    // something harmless to pop.
    window.history.pushState(window.history.state, '');
    pushedRef.current = true;

    const onPopState = () => {
      pushedRef.current = false; // our entry was consumed by Back
      onOpenChangeRef.current?.(false);
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      // Closed via the UI, not Back → drop the throwaway entry we added.
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [open]);
}
