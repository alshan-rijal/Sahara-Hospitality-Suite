import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { site } from '../config/site';
import { breadcrumbSchema } from '../lib/structuredData';
import JsonLd from './JsonLd';
import SiteJsonLd from './SiteJsonLd';
import SkipLink from './SkipLink';
import FloatingContact from './FloatingContact';
import PageFallback from './PageFallback';

/** Shared header/footer for indexable public pages (Help, privacy, etc.). */
export default function PublicLayout() {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  return (
    <div className="public-page">
      <SkipLink />
      <header className="public-header">
        <Link to="/login" aria-label={`${site.name} — sign in`}>
          <img src="/brand/sahara-logo-full.png" alt={site.name} width="1000" height="262" />
        </Link>
        <nav aria-label="Public">
          <Link to="/login" aria-current={pathname === '/login' ? 'page' : undefined}>Sign in</Link>
          <Link to="/help" aria-current={pathname === '/help' ? 'page' : undefined}>Help &amp; FAQ</Link>
        </nav>
      </header>

      <main className="public-main" id="main-content">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="public-footer">
        <span>© {year} {site.name}. Built by {site.author}.</span>
        <nav aria-label="Footer">
          <a href={site.social.website} target="_blank" rel="noreferrer">{site.social.website.replace('https://', '')}</a>
          {' · '}
          <a href={`mailto:${site.email}`}>{site.email}</a>
          {' · '}
          <Link to="/help">Help</Link>
        </nav>
      </footer>

      <FloatingContact />

      <SiteJsonLd />
      <JsonLd id="ld-breadcrumb" data={breadcrumbSchema([{ name: 'Home', path: '/login' }, { name: pathname === '/help' ? 'Help & FAQ' : 'Page', path: pathname }])} />
    </div>
  );
}
