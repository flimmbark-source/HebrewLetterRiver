const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => off(event, handler);
}

export function once(event, handler) {
  const offHandler = on(event, (payload) => {
    offHandler();
    handler(payload);
  });
  return offHandler;
}

export function off(event, handler) {
  const set = listeners.get(event);
  if (!set) return;
  set.delete(handler);
  if (set.size === 0) listeners.delete(event);
}

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  [...set].forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      console.error('event handler error', event, err);
    }
  });
}

export function clearAllListeners() {
  listeners.clear();
}
