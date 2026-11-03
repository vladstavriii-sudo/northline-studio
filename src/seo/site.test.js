import { describe, expect, it } from 'vitest';

import {
  PLACEHOLDER_SEO,
  PROJECT_SLUGS,
  ROUTE_SEO,
  SITEMAP_ROUTES,
} from './site.js';
import { PROJECTS } from '@/content/projects.data.js';
import router from '@/router/index.js';

describe('sitemap routes', () => {
  it('lists exactly the case studies that have a page', () => {
    const published = PROJECTS.filter((project) => project.page).map(
      (project) => project.slug,
    );

    expect([...PROJECT_SLUGS].sort()).toEqual([...published].sort());
  });

  it('does not list the placeholder case, which has no page behind it', () => {
    expect(PROJECT_SLUGS).not.toContain('no-project');
    expect(SITEMAP_ROUTES.map((route) => route.path)).not.toContain(
      '/project/your-project',
    );
  });

  it('has one entry per path', () => {
    const paths = SITEMAP_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('route metadata', () => {
  const named = router
    .getRoutes()
    .map((route) => route.name)
    .filter(Boolean);

  it('gives every route its own title and description', () => {
    const covered = named.filter((name) => name !== 'project');

    for (const name of covered) {
      expect(ROUTE_SEO[name], `no SEO copy for route "${name}"`).toBeTruthy();
      expect(ROUTE_SEO[name].title).toBeTruthy();
      expect(ROUTE_SEO[name].description).toBeTruthy();
    }
  });

  it('keeps descriptions short enough to survive a search result', () => {
    const all = { ...ROUTE_SEO, placeholder: PLACEHOLDER_SEO };

    for (const [name, seo] of Object.entries(all)) {
      expect(seo.description.length, `${name} description`).toBeLessThan(161);
    }
  });

  it('keeps the pages with nothing behind them out of the index', () => {
    expect(PLACEHOLDER_SEO.noindex).toBe(true);
    expect(ROUTE_SEO['not-found'].noindex).toBe(true);
  });
});
