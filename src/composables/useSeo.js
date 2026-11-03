import { onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { DEFAULT_SEO, ROUTE_SEO, SITE_NAME } from '@/seo/site.js';

const override = ref(null);

const siteUrl = () =>
  (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

function tag(key, attr) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }

  return el;
}

const setMeta = (key, content, attr = 'name') => {
  tag(key, attr).setAttribute('content', content);
};

function setCanonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]');

  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }

  el.href = url;
}

const absolute = (path) =>
  /^https?:\/\//.test(path) ? path : `${siteUrl()}${path}`;

function applySeo(seo, path) {
  const meta = { ...DEFAULT_SEO, ...seo };
  const url = `${siteUrl()}${path}`;
  const image = absolute(meta.image);

  document.title = meta.title;

  setMeta('description', meta.description);
  setMeta('robots', meta.noindex ? 'noindex, follow' : 'index, follow');
  setCanonical(url);

  setMeta('og:site_name', SITE_NAME, 'property');
  setMeta('og:type', meta.type ?? 'website', 'property');
  setMeta('og:title', meta.title, 'property');
  setMeta('og:description', meta.description, 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:image', image, 'property');

  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', meta.title);
  setMeta('twitter:description', meta.description);
  setMeta('twitter:image', image);
}

export function useSeo(getter) {
  watch(
    getter,
    (value) => {
      override.value = value ?? null;
    },
    { immediate: true, flush: 'post' },
  );

  onUnmounted(() => {
    override.value = null;
  });
}

export function useDocumentHead() {
  const route = useRoute();

  watch(
    () => [route.path, route.name, override.value],
    () => {
      if (!route.name) return;
      applySeo(override.value ?? ROUTE_SEO[route.name], route.path);
    },
    { immediate: true },
  );
}
