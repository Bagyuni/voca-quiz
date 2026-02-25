import { useCallback, useEffect, useRef } from 'react';

const DRAG_THRESHOLD = 5;

/** Enables horizontal drag-to-scroll on a container element. */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const state = useRef({
    active: false,
    dragging: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
  });

  const onPointerDown = useCallback((e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    state.current = {
      active: true,
      dragging: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    };
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const el = ref.current;
    const s = state.current;
    if (!el || !s.active) return;

    const dx = e.clientX - s.startX;

    if (!s.dragging && Math.abs(dx) >= DRAG_THRESHOLD) {
      s.dragging = true;
      el.setPointerCapture(s.pointerId);
      el.style.cursor = 'grabbing';
    }

    if (s.dragging) {
      el.scrollLeft = s.scrollLeft - dx;
    }
  }, []);

  const onPointerUp = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const wasDragging = state.current.dragging;
    if (wasDragging) {
      el.releasePointerCapture(state.current.pointerId);
      el.style.cursor = '';
    }
    state.current.active = false;
    state.current.dragging = false;
  }, []);

  /** Block click only after a real drag. */
  const onClick = useCallback((e: MouseEvent) => {
    if (state.current.dragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('click', onClick, true);
    };
  }, [onPointerDown, onPointerMove, onPointerUp, onClick]);

  return ref;
}
