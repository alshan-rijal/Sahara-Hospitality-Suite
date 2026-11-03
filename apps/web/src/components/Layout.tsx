import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Mail, Globe, UserRound, Menu, X, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { modules } from '../lib/moduleConfig';
import { icons } from '../lib/icons';
import { useEscape, useFocusTrap } from '../lib/hooks';
import { site } from '../config/site';
import Breadcrumbs from './Breadcrumbs';
import CommandPalette from './CommandPalette';
import ScrollProgress from './ScrollProgress';
import BackToTop from './BackToTop';
import SkipLink from './SkipLink';
import PageFallback from './PageFallback';

export default function Layout() {
  const { user, logout, can } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLElement>(null);
  const visible = modules.filter(module => can(module.readPermission));

  const HomeIcon = icons.home;
  const LogoutIcon = icons.logout;
  const scope = user?.properties?.map(property => property.code).join(' · ') || 'All properties';

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);
  useEscape(() => setDrawerOpen(false), drawerOpen);
  useFocusTrap(drawerRef, drawerOpen);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-shell">
      <SkipLink />
      <ScrollProgress />
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`} ref={drawerRef} id="primary-navigation">
        <div className="brand">
          <img className="brand-logo" src="/brand/sahara-logo-white.png" alt="Sahara Hospitality Suite" width="1000" height="248" />
          <button className="drawer-close" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
            <X size={18} aria-hidden />
          </button>
        </div>
        <nav aria-label="Modules">
          <NavLink to="/" end onClick={() => setDrawerOpen(false)}>
            <HomeIcon size={18} strokeWidth={2} aria-hidden />
            Dashboard
          </NavLink>
          {visible.map(module => {
            const ModuleIcon = icons[module.icon];
            return (
              <NavLink key={module.key} to={`/module/${module.key}`} onClick={() => setDrawerOpen(false)}>
                <ModuleIcon size={18} strokeWidth={2} aria-hidden />
                {module.title}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar" aria-hidden>{user?.name?.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role.name}</span>
            </div>
          </div>
          <button className="ghost danger-text" onClick={logout}>
            <LogoutIcon size={16} strokeWidth={2} aria-hidden />
            Sign out
          </button>
          <div className="build-credit">
            <a href={site.social.website} target="_blank" rel="noreferrer"><UserRound size={12} aria-hidden /> {site.author}</a>
            <a href={`mailto:${site.email}`}><Mail size={12} aria-hidden /> {site.email}</a>
            <a href={site.social.website} target="_blank" rel="noreferrer"><Globe size={12} aria-hidden /> {site.social.website.replace('https://', '')}</a>
          </div>
        </div>
      </aside>
      <main className="main" id="main-content">
        <header className="topbar">
          <div className="topbar-inner">
          <button
            className="menu-button"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="primary-navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} aria-hidden />
          </button>
          <Breadcrumbs />
          <div className="topbar-tools">
            <button className="command-trigger" onClick={() => setPaletteOpen(true)} aria-label="Search modules">
              <Search size={15} aria-hidden />
              <span>Search</span>
              <kbd>Ctrl K</kbd>
            </button>
            <span
              className="scope-chip"
              title={`Property scope: ${scope} · Access scope: ${user?.role.scope}`}
            >
              <ShieldCheck size={13} aria-hidden />
              <span className="scope-text">{scope}</span>
              <b>{user?.role.scope}</b>
            </span>
            <span className="topbar-badge">Level {user?.role.level}</span>
          </div>
          </div>
        </header>
        <div className="content">
          <div className="page" key={location.pathname}>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
      {drawerOpen && <div className="overlay" onClick={() => setDrawerOpen(false)} />}
      <BackToTop />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
