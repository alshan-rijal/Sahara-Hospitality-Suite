import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { useSeo } from '../lib/seo';

export default function NotFoundPage() {
  useSeo({
    title: 'Page not found | Sahara Hospitality Suite',
    description: 'The page you were looking for could not be found.',
    path: '/404',
    noindex: true
  });

  return (
    <div className="empty-state rise standalone">
      <span className="empty-art" aria-hidden>
        <svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet">
          <circle cx="160" cy="36" r="20" className="empty-sun" />
          <path d="M0 84 Q55 52 110 84 T220 84 V120 H0 Z" className="empty-dune-back" />
          <path d="M0 98 Q60 74 120 98 T240 98 V120 H0 Z" className="empty-dune-front" />
        </svg>
        <span className="empty-badge"><Compass size={20} strokeWidth={1.8} aria-hidden /></span>
      </span>
      <h1>We can’t find that page</h1>
      <p>It may have moved, or your role might not have access to it. Head back to your dashboard and try again.</p>
      <Link className="button-link" to="/">
        <Home size={16} aria-hidden />
        Back to dashboard
      </Link>
    </div>
  );
}
