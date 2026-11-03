import type { ReactNode } from 'react';
import { Inbox, SearchX, TriangleAlert, Lock } from 'lucide-react';

type Art = 'records' | 'search' | 'error' | 'access';
const artIcon = { records: Inbox, search: SearchX, error: TriangleAlert, access: Lock } as const;

/**
 * Empty state with a small hand-drawn dune scene rather than stock art.
 * `action` is the primary next step; keep it to one clear button.
 */
export default function EmptyState({ art = 'records', title, description, action, small = false }: {
  art?: Art;
  title: string;
  description?: string;
  action?: ReactNode;
  small?: boolean;
}) {
  const Icon = artIcon[art];
  return (
    <div className={`empty-state${small ? ' small' : ''}`}>
      <span className="empty-art" aria-hidden>
        <svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet">
          <circle cx="160" cy="36" r="20" className="empty-sun" />
          <path d="M0 84 Q55 52 110 84 T220 84 V120 H0 Z" className="empty-dune-back" />
          <path d="M0 98 Q60 74 120 98 T240 98 V120 H0 Z" className="empty-dune-front" />
        </svg>
        <span className="empty-badge"><Icon size={20} strokeWidth={1.8} aria-hidden /></span>
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
