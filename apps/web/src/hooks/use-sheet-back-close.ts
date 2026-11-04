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

// Makes the phone/browser Back button (and the Android back gesture) CLOSE the topmost
// open overlay (sheet, fullscreen takeover) instead of navigating to another URL.
//
// Each open overlay owns one throwaway history entry with the SAME URL, kept in a
// module-level stack in the same order as the entries. Back pops one entry → a single
// global popstate listener closes ONLY the overlay on top of the stack, so a portion
// sheet stacked over the diary "Add" view closes on its own without taking the view
// with it. The URL never changes, so the router stays put.
//
// Closing via the UI (X / Done / overlay) removes the overlay's entry with a deferred
// history.go(-n), batched in a microtask, and that popstate is ignored so it can't
// close the overlay underneath. If another overlay opens in the same commit (sheet →
// sheet hand-off), it reuses the entry that was about to be popped instead of pushing a
// new one — otherwise the deferred pop would land on the new overlay's entry and
// history would drift by one (Back "doing nothing", or a UI close navigating back).
//
// If an overlay unmounts because something INSIDE it navigated forward to a different
// URL (an Edit/Open button, a Link), its entry is buried under the new route's entry;
// popping it would undo that navigation, so it's left alone.
//
// `onOpenChange` is read through a ref so an inline handler (new identity each render)
// doesn't retrigger the effect; only `open` drives it. No-ops for uncontrolled sheets
// (no `open`/`onOpenChange`).

interface BackEntry {
  close: () => void;
  consumed: boolean;
}

const stack: BackEntry[] = [];
let pendingPops = 0;
let pendingHref = '';
let ignoredPops = 0;
// Attached once and never removed: a self-inflicted go(-n) may fire its popstate after
// the last overlay unmounted, and it must still be swallowed rather than leak into the
// next real Back.
let listening = false;

function onPopState() {
  if (ignoredPops > 0) {
    ignoredPops -= 1;
    return;
  }
  const top = stack[stack.length - 1];
  if (!top) return;
  // A camera/file-picker return can emit a spurious popstate (Android). Don't treat it
  // as Back — keep the overlay open and restore its entry so a real Back still works.
  if (filePickActive) {
    window.history.pushState(window.history.state, '');
    return;
  }
  stack.pop();
  top.consumed = true; // its entry was consumed by Back
  top.close();
}

function schedulePop() {
  if (pendingPops === 0) {
    pendingHref = window.location.href;
    queueMicrotask(() => {
      const n = pendingPops;
      pendingPops = 0;
      // A forward navigation in the meantime buried our entries — leave them be.
      if (n === 0 || window.location.href !== pendingHref) return;
      ignoredPops += 1; // one go(-n) fires a single popstate
      window.history.go(-n);
    });
  }
  pendingPops += 1;
}

export function useSheetBackClose(
  open: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open || !onOpenChangeRef.current) return;

    const pushedHref = window.location.href;
    if (pendingPops > 0 && pushedHref === pendingHref) {
      // Hand-off from an overlay that just closed: take over its entry.
      pendingPops -= 1;
    } else {
      // Duplicate the current entry (same URL + router state) so Back has something
      // harmless to pop.
      window.history.pushState(window.history.state, '');
    }

    const entry: BackEntry = {
      close: () => onOpenChangeRef.current?.(false),
      consumed: false,
    };
    if (!listening) {
      window.addEventListener('popstate', onPopState);
      listening = true;
    }
    stack.push(entry);

    return () => {
      const index = stack.indexOf(entry);
      if (index !== -1) stack.splice(index, 1);
      // Closed via the UI while still on the same URL → drop the entry we added.
      if (!entry.consumed && window.location.href === pushedHref) schedulePop();
    };
  }, [open]);
}
