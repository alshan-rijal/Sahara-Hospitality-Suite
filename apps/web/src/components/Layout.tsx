import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Globe, UserRound, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { modules, moduleByKey } from '../lib/moduleConfig';
import { icons } from '../lib/icons';

export default function Layout() {
  const { user, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { moduleKey } = useParams();
  const visible = modules.filter(module => can(module.readPermission));

  const HomeIcon = icons.home;
  const LogoutIcon = icons.logout;
  const activeModule = moduleKey ? moduleByKey[moduleKey] : undefined;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <img className="brand-logo" src="/brand/sahara-logo-white.png" alt="Sahara Hospitality Suite" />
        </div>
        <nav>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            <HomeIcon size={18} strokeWidth={2} aria-hidden />
            Dashboard
          </NavLink>
          {visible.map(module => {
            const ModuleIcon = icons[module.icon];
            return (
              <NavLink key={module.key} to={`/module/${module.key}`} onClick={() => setOpen(false)}>
                <ModuleIcon size={18} strokeWidth={2} aria-hidden />
                {module.title}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
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
            <a href="https://alshanrijal.com.np" target="_blank" rel="noreferrer">
              <UserRound size={12} aria-hidden /> Alshan Rijal
            </a>
            <a href="https://alshanrijal.com.np" target="_blank" rel="noreferrer">
              <Globe size={12} aria-hidden /> alshanrijal.com.np
            </a>
            <a href="mailto:contact@alshanrijal.com.np">
              <Mail size={12} aria-hidden /> contact@alshanrijal.com.np
            </a>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="menu-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
            <Menu size={20} />
          </button>
          <div>
            <h1>{activeModule ? activeModule.title : location.pathname === '/' ? 'Executive Dashboard' : 'Hotel Operations'}</h1>
            <p>{user?.properties?.map(property => property.code).join(' · ') || 'Corporate scope'} · {user?.role.scope} access</p>
          </div>
          <div className="topbar-badge">Level {user?.role.level}</div>
        </header>
        <div className="content">
          <div className="page" key={location.pathname}>
            <Outlet />
          </div>
        </div>
      </main>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}
