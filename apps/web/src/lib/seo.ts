import { useEffect } from 'react';
import { site } from '../config/site';

export interface SeoOptions {
  title: string;
  description: string;
  /** Path only, e.g. "/help" — the origin is added from site.url. */
  path: string;
  /** Authenticated/app routes set this so search engines stay out. */
  noindex?: boolean;
  /** Path or absolute URL for the social preview image. */
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const MANAGED = 'data-sahara-seo';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  el.setAttribute(MANAGED, '');
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  el.setAttribute(MANAGED, '');
}

/** Keeps document metadata in sync with the active route. */
export function useSeo({ title, description, path, noindex = false, image, type = 'website', jsonLd }: SeoOptions) {
  const url = site.url + path;
  const imageUrl = image ? (image.startsWith('http') ? image : site.url + image) : `${site.url}/og-image.png`;
  const serialised = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', site.name);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', imageUrl);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);
    setCanonical(url);
  }, [title, description, url, noindex, imageUrl, type]);

  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute(MANAGED, '');
    el.textContent = serialised;
    if (serialised) document.head.appendChild(el);
    return () => { el.remove(); };
  }, [serialised]);
}
