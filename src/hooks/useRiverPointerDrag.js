import { useEffect, useRef } from 'react';

let dragGhost = null;

function ensureDragGhost() {
  if (dragGhost && document.body.contains(dragGhost)) {
    return dragGhost;
  }
  const ghost = document.createElement('div');
  ghost.id = 'river-drag-ghost';
  ghost.style.position = 'fixed';
  ghost.style.zIndex = '1000';
  ghost.style.pointerEvents = 'none';
  ghost.style.transform = 'translate(-50%, -50%)';
  ghost.style.opacity = '0';
  document.body.appendChild(ghost);
  dragGhost = ghost;
  return ghost;
}

function hideGhost() {
  if (!dragGhost) return;
  dragGhost.style.opacity = '0';
  dragGhost.style.display = 'none';
  dragGhost.textContent = '';
  dragGhost.className = '';
}

function zoneAtPosition(zones, x, y) {
  if (!Array.isArray(zones)) return null;
  for (let index = 0; index < zones.length; index += 1) {
    const zone = zones[index];
    const element = zone?.element;
    if (!element) continue;
    const rect = element.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return zone;
    }
  }
  return null;
}

export function useRiverPointerDrag(ref, options = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const enabled = Boolean(options.enabled);

  useEffect(() => {
    const element = ref?.current;
    if (!element) return undefined;
    if (!enabled) return undefined;

    let hoverZone = null;
    let activeDrag = null;

    const clearHover = () => {
      if (hoverZone?.element) {
        hoverZone.element.classList.remove('drag-over');
      }
      hoverZone = null;
    };

    const endDrag = (shouldRestore) => {
      if (!activeDrag) return;
      const { pointerId, originalAnimation, originalVisibility, originalTransition } = activeDrag;
      element.releasePointerCapture?.(pointerId);
      element.classList.remove('dragging');
      if (shouldRestore) {
        element.style.visibility = originalVisibility;
        element.style.animationPlayState = originalAnimation;
      }
      if (typeof originalTransition === 'string') {
        element.style.transition = originalTransition;
      }
      activeDrag = null;
      hideGhost();
      clearHover();
      optionsRef.current.onDragEnd?.();
    };

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (!optionsRef.current.enabled) return;
      event.preventDefault();
      const payload = optionsRef.current.payload;
      element.setPointerCapture?.(event.pointerId);
      const ghost = ensureDragGhost();
      const ghostText = optionsRef.current.getGhostContent?.(payload, element) ?? element.textContent ?? '';
      const ghostClassName = optionsRef.current.ghostClassName ?? '';
      ghost.textContent = ghostText;
      ghost.className = `pointer-events-none select-none ${ghostClassName}`.trim();
      ghost.style.display = 'block';
      ghost.style.opacity = '0.95';
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;

      const originalAnimation = element.style.animationPlayState;
      const originalVisibility = element.style.visibility;
      const originalTransition = element.style.transition;
      element.style.animationPlayState = 'paused';
      element.classList.add('dragging');
      element.style.visibility = 'hidden';
      if (optionsRef.current.freezeWhileDragging) {
        element.style.transition = 'none';
      }

      activeDrag = {
        pointerId: event.pointerId,
        originalAnimation,
        originalVisibility,
        originalTransition
      };

      optionsRef.current.onDragStart?.({ event, payload });
    };

    const onPointerMove = (event) => {
      if (!activeDrag) return;
      const payload = optionsRef.current.payload;
      const ghost = ensureDragGhost();
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
      const zones = optionsRef.current.getDropZones?.(payload) ?? [];
      const nextZone = zoneAtPosition(zones, event.clientX, event.clientY);
      if (nextZone !== hoverZone) {
        hoverZone?.element?.classList?.remove('drag-over');
        nextZone?.element?.classList?.add('drag-over');
        hoverZone = nextZone;
        optionsRef.current.onHoverChange?.({ event, payload, zone: hoverZone?.data ?? null });
      }
    };

    const finishDrop = (event, cancelled = false) => {
      if (!activeDrag) return;
      const payload = optionsRef.current.payload;
      const zones = optionsRef.current.getDropZones?.(payload) ?? [];
      const zone = cancelled ? null : zoneAtPosition(zones, event.clientX, event.clientY);
      let accepted = false;
      if (zone && typeof optionsRef.current.onDrop === 'function') {
        const result = optionsRef.current.onDrop({ event, zone, payload, element });
        if (typeof result === 'object' && result !== null) {
          accepted = Boolean(result.accepted);
        } else {
          accepted = Boolean(result);
        }
        if (accepted) {
          optionsRef.current.onDropAccepted?.({ zone, payload });
        } else {
          optionsRef.current.onDropRejected?.({ zone, payload });
        }
      } else if (!zone && typeof optionsRef.current.onDrop === 'function' && cancelled) {
        optionsRef.current.onDrop({ event, zone: null, payload, element });
      }
      const shouldRestore = !accepted;
      endDrag(shouldRestore);
    };

    const onPointerUp = (event) => {
      finishDrop(event, false);
    };

    const onPointerCancel = (event) => {
      finishDrop(event, true);
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerCancel);
    element.addEventListener('lostpointercapture', onPointerCancel);

    return () => {
      hideGhost();
      clearHover();
      endDrag(true);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerCancel);
      element.removeEventListener('lostpointercapture', onPointerCancel);
    };
  }, [ref, enabled]);
}
