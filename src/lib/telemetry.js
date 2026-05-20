function getPageLocation(pathname = window.location.pathname) {
  return `${window.location.origin}${pathname}`;
}

export function trackPageView(pathname, title = document.title) {
  if (typeof window === 'undefined') return;

  window.gtag?.('event', 'page_view', {
    page_title: title,
    page_location: getPageLocation(pathname),
    page_path: pathname
  });
}

export function trackException(error, { fatal = false, context = 'unknown' } = {}) {
  if (typeof window === 'undefined') return;

  const description = error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);

  window.gtag?.('event', 'exception', {
    description,
    fatal,
    context
  });

  if (window.Sentry?.captureException) {
    window.Sentry.captureException(error, { tags: { context, fatal: String(fatal) } });
  }
}
