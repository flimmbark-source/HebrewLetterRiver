export function getJerusalemDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

export function millisUntilNextJerusalemMidnight() {
  const now = new Date();
  const jerusalemNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const next = new Date(jerusalemNow);
  next.setHours(24, 0, 5, 0);
  return Math.max(next.getTime() - jerusalemNow.getTime(), 60_000);
}

export function formatJerusalemTime(date = new Date(), options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }).format(date);
}

export function differenceInJerusalemDays(previousKey, currentKey) {
  if (!previousKey || !currentKey) return null;
  const [py, pm, pd] = previousKey.split('-').map(Number);
  const [cy, cm, cd] = currentKey.split('-').map(Number);
  if (!py || !pm || !pd || !cy || !cm || !cd) return null;
  const prev = Date.UTC(py, pm - 1, pd);
  const curr = Date.UTC(cy, cm - 1, cd);
  return Math.round((curr - prev) / 86_400_000);
}
