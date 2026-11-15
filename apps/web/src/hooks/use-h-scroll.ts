import { type RefCallback, useEffect, useState } from 'react';

// The element a row treats as "current": a pressed chip, or a router link's active page.
const ACTIVE_SELECTOR = '[aria-pressed="true"], [aria-current="page"], [data-status="active"]';
// Pointer travel (px) after which a press counts as a drag, not a click.
const DRAG_THRESHOLD = 5;

// Makes a hidden-scrollbar horizontal row (chips, tabs) usable everywhere:
// - touch: native swipe (untouched);
// - mouse wheel / trackpad: vertical wheel scrolls the row sideways while it can move;
// - mouse: press-and-drag scrolls it, and the click that ends a drag is swallowed;
// - whenever `activeKey` changes, the active item glides to the row's centre.
// Returns a callback ref, so a row that mounts later (conditionally rendered) still
// gets wired up.
export function useHScroll<T extends HTMLElement>(activeKey?: unknown): RefCallback<T> {
  const [el, setEl] = useState<T | null>(null);

  useEffect(() => {
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.deltaY === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atEdge = (e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max);
      if (atEdge) return; // let the page scroll on
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    let startX = 0;
    let startScroll = 0;
    let pointerId: number | null = null;
    let dragged = false;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      dragged = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!dragged) {
        dragged = true;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
      }
      el.scrollLeft = startScroll - dx;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      el.style.cursor = '';
    };
    const onClickCapture = (e: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('click', onClickCapture, true);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [el]);

  useEffect(() => {
    const active = el?.querySelector<HTMLElement>(ACTIVE_SELECTOR);
    if (!el || !active) return;
    // Centre within the row only (scrollIntoView would also scroll the page/sheet).
    const row = el.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    const target = el.scrollLeft + (item.left - row.left) - (row.width - item.width) / 2;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
  }, [el, activeKey]);

  return setEl;
}
