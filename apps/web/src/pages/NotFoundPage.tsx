import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="empty-state rise">
      <Compass size={40} strokeWidth={1.6} aria-hidden style={{ color: 'var(--gold)' }} />
      <h2>Page not found</h2>
      <p>We couldn’t find that page. It may have moved, or you may not have access to it.</p>
      <Link className="button-link" to="/">
        <Home size={16} aria-hidden />
        Back to dashboard
      </Link>
    </div>
  );
}
