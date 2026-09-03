import { useEffect, useRef } from 'react';

// True while a file/camera picker launched from inside a sheet is open. On Android,
// returning from the camera (capture="image/*") can emit a spurious popstate — which
// would otherwise pop our throwaway entry and close the sheet mid-flow. Callers wrap
// their file-input trigger with markFilePickActive() so the sheet ignores that one.
let filePickActive = false;

export function markFilePickActive() {
  filePickActive = true;
  // Clear once the page regains focus (we're back from the picker), plus a grace
  // window since the popstate can land just after the focus event, not before it.
  const clear = () => {
    window.removeEventListener('focus', clear);
    setTimeout(() => {
      filePickActive = false;
    }, 1000);
  };
  window.addEventListener('focus', clear);
}

// Makes the phone/browser Back button (and the Android back gesture) CLOSE an open
// sheet instead of navigating to another URL.
//
// When a controlled sheet opens we push a throwaway history entry with the SAME URL.
// Back then pops that entry — we catch the popstate and close the sheet, and because
// the URL never changed the router stays put. If the sheet is closed via the UI (X /
// Done / overlay) while still on that URL, we remove the throwaway entry so history
// stays clean and the next Back goes where the user expects.
//
// Critically, if the sheet unmounts because something INSIDE it navigated forward to a
// different URL (an Edit/Open button, a Link), the throwaway entry is now buried under
// the new route's entry. Calling history.back() there would pop the NEW entry and bounce
// the user straight back — the navigation would visibly flash and revert. So the cleanup
// only pops the throwaway when we're still on the URL it duplicated; after a forward
// navigation it leaves the (harmless, deduped-away) entry alone.
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
    // something harmless to pop. Remember that URL so cleanup can tell a UI close
    // (same URL) from a forward navigation out of the sheet (URL changed).
    const pushedHref = window.location.href;
    window.history.pushState(window.history.state, '');
    pushedRef.current = true;

    const onPopState = () => {
      // A camera/file-picker return can emit a spurious popstate (Android). Don't treat
      // it as Back — keep the sheet open and restore the throwaway entry so a real Back
      // still works afterwards.
      if (filePickActive) {
        window.history.pushState(window.history.state, '');
        return;
      }
      pushedRef.current = false; // our entry was consumed by Back
      onOpenChangeRef.current?.(false);
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      // Closed via the UI while still on the same URL → drop the throwaway entry we
      // added. If a forward navigation changed the URL, the entry is now buried under
      // the new route; popping it would undo that navigation, so leave it be.
      if (pushedRef.current && window.location.href === pushedHref) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [open]);
}
