const DEFAULT_META = {
  title: 'Letter River | Learn Hebrew Through Play',
  description: 'Letter River is a game-based Hebrew learning app that helps beginners practice letters, sounds, and early reading with short, motivating lessons.',
  canonicalPath: '/',
  robots: 'index, follow'
};

const ROUTE_META = {
  '/': DEFAULT_META,
  '/home': {
    title: 'Demo | Letter River',
    description: 'Try the Letter River learning demo and continue your Hebrew practice path.',
    canonicalPath: '/home',
    robots: 'noindex, follow'
  },
  '/achievements': {
    title: 'Achievements | Letter River',
    description: 'Review streaks, progress, and learning milestones in Letter River.',
    canonicalPath: '/achievements',
    robots: 'noindex, follow'
  },
  '/read': {
    title: 'Reading Practice | Letter River',
    description: 'Practice words in short reading and conversation contexts in Letter River.',
    canonicalPath: '/read',
    robots: 'noindex, follow'
  },
  '/bridge': {
    title: 'Bridge Builder | Letter River',
    description: 'Build word knowledge through compact Hebrew vocabulary practice in Letter River.',
    canonicalPath: '/bridge',
    robots: 'noindex, follow'
  },
  '/deep-script': {
    title: 'Deep Script | Letter River',
    description: 'Reinforce letters, words, and reading through challenge-style practice in Letter River.',
    canonicalPath: '/deep-script',
    robots: 'noindex, follow'
  },
  '/daily': {
    title: 'Daily Practice | Letter River',
    description: 'See daily language-learning practice tasks in Letter River.',
    canonicalPath: '/daily',
    robots: 'noindex, follow'
  },
  '/settings': {
    title: 'Settings | Letter River',
    description: 'Adjust language, display, and practice preferences in Letter River.',
    canonicalPath: '/settings',
    robots: 'noindex, follow'
  },
  '/debug': {
    title: 'Debug | Letter River',
    description: 'Internal debugging tools for Letter River.',
    canonicalPath: '/debug',
    robots: 'noindex, nofollow'
  }
};

function ensureMeta(name) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  return tag;
}

function ensurePropertyMeta(property) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureCanonical() {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  return tag;
}

export function getRouteMeta(pathname) {
  return ROUTE_META[pathname] ?? {
    title: 'Page not found | Letter River',
    description: 'This Letter River page could not be found.',
    canonicalPath: pathname,
    robots: 'noindex, nofollow'
  };
}

export function applyRouteMeta(pathname) {
  if (typeof document === 'undefined') return;
  const meta = getRouteMeta(pathname);
  const canonicalUrl = new URL(meta.canonicalPath || pathname || '/', window.location.origin).toString();

  document.title = meta.title;
  ensureMeta('description').content = meta.description;
  ensureMeta('robots').content = meta.robots || DEFAULT_META.robots;
  ensureCanonical().href = canonicalUrl;

  ensurePropertyMeta('og:title').content = meta.title;
  ensurePropertyMeta('og:description').content = meta.description;
  ensurePropertyMeta('og:url').content = canonicalUrl;

  ensureMeta('twitter:title').content = meta.title;
  ensureMeta('twitter:description').content = meta.description;
}

export function isKnownRoute(pathname) {
  return Boolean(ROUTE_META[pathname]);
}
