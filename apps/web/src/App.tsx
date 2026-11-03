import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import PageFallback from './components/PageFallback';
import CookieConsent from './components/CookieConsent';
import { captureUtm } from './lib/tracking';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Returning to the top on navigation keeps long tables usable. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => { captureUtm(); }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Suspense fallback={<PageFallback />}><LoginPage /></Suspense>} />
        <Route element={<PublicLayout />}>
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="module/:moduleKey" element={<ModulePage />} />
          </Route>
        </Route>
      </Routes>
      <CookieConsent />
    </>
  );
}
