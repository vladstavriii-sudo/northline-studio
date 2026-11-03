export const SITE_NAME = 'Northline studio';

export const DEFAULT_SEO = {
  title:
    'Northline studio | Websites, AI video and advertising — built around your goals.',
  description:
    'Northline studio designs and builds websites, AI video and advertising for brands that want work built around their goals, not around a template.',
  image: '/og-cover.webp',
  type: 'website',
};

export const ROUTE_SEO = {
  home: DEFAULT_SEO,

  terms: {
    title: 'Terms of Use | Northline studio',
    description:
      'The terms that apply to using the Northline studio website and to working with the studio.',
  },

  privacy: {
    title: 'Privacy Policy | Northline studio',
    description:
      'How Northline studio collects, uses and stores personal data, and the choices you have over it.',
  },

  'not-found': {
    title: 'Page not found | Northline studio',
    description: 'The page you are after does not exist or has moved.',
    noindex: true,
  },
};

export const PLACEHOLDER_SEO = {
  title: 'Your project | Northline studio',
  description:
    'The next case study in the archive is the one we have not made yet.',
  noindex: true,
};

export const PROJECT_SLUGS = ['nexa-ai', 'tervex', 'norvale'];

export const SITEMAP_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  ...PROJECT_SLUGS.map((slug) => ({
    path: `/project/${slug}`,
    priority: '0.8',
    changefreq: 'yearly',
  })),
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
];
