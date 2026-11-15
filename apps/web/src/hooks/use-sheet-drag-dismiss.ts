import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRef } from 'react';

// Distance (px) or downward speed (px/ms) past which letting go closes the sheet.
const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.6;
const SETTLE_MS = 200;

// Drag-to-dismiss for a mobile bottom sheet, driven from its grab-handle zone: the
// sheet follows the finger downward (never up), and on release either slides out and
// closes (far or fast enough) or springs back. Closing slides it the rest of the way
// itself, then clicks the sheet's own close button with the exit animation switched
// off — Radix's slide-out would otherwise restart from the top.
export function useSheetDragDismiss() {
  const drag = useRef<{ y: number; t: number; dy: number; v: number } | null>(null);

  const contentOf = (el: Element) => el.closest<HTMLElement>('[data-slot="sheet-content"]');

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    const content = contentOf(e.currentTarget);
    if (!content) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, t: e.timeStamp, dy: 0, v: 0 };
    content.style.transition = 'none';
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const d = drag.current;
    const content = contentOf(e.currentTarget);
    if (!d || !content) return;
    const dy = Math.max(0, e.clientY - d.y);
    const dt = Math.max(1, e.timeStamp - d.t);
    d.v = (dy - d.dy) / dt;
    d.dy = dy;
    d.t = e.timeStamp;
    content.style.transform = `translateY(${dy}px)`;
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    const d = drag.current;
    const content = contentOf(e.currentTarget);
    drag.current = null;
    if (!d || !content) return;
    content.style.transition = `transform ${SETTLE_MS}ms ease-out`;
    if (d.dy > DISMISS_DISTANCE || d.v > DISMISS_VELOCITY) {
      content.style.transform = 'translateY(100%)';
      window.setTimeout(() => {
        content.style.animation = 'none';
        content.querySelector<HTMLElement>('[data-slot="sheet-close-x"]')?.click();
      }, SETTLE_MS);
    } else {
      content.style.transform = '';
      window.setTimeout(() => {
        content.style.transition = '';
      }, SETTLE_MS);
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
