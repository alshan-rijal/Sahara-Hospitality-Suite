import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { modules } from '../lib/moduleConfig';
import { icons, type IconName } from '../lib/icons';
import { useAuth } from '../context/AuthContext';
import { useEscape, useFocusTrap, useScrollLock } from '../lib/hooks';

interface Entry { key: string; title: string; to: string; icon: IconName; read?: string }

/** Ctrl/Cmd+K launcher for jumping to any module the signed-in role can see. */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscape(onClose, open);
  useScrollLock(open);
  useFocusTrap(dialogRef, open);

  useEffect(() => { if (open) { setQuery(''); setCursor(0); } }, [open]);

  const entries = useMemo<Entry[]>(() => {
    const all: Entry[] = [
      { key: 'dashboard', title: 'Dashboard', to: '/', icon: 'dashboard' },
      ...modules.map(module => ({ key: module.key, title: module.title, to: `/module/${module.key}`, icon: module.icon, read: module.readPermission }))
    ];
    const needle = query.trim().toLowerCase();
    return all.filter(entry => (!entry.read || can(entry.read)) && entry.title.toLowerCase().includes(needle));
  }, [can, query]);

  useEffect(() => { setCursor(0); }, [query]);

  if (!open) return null;

  const go = (entry: Entry) => { navigate(entry.to); onClose(); };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setCursor(value => Math.min(value + 1, entries.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setCursor(value => Math.max(value - 1, 0)); }
    else if (event.key === 'Enter') { event.preventDefault(); const entry = entries[cursor]; if (entry) go(entry); }
  };

  return (
    <div className="palette-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search modules" ref={dialogRef}>
        <div className="palette-search">
          <Search size={17} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search modules…"
            aria-label="Search modules"
            aria-activedescendant={entries[cursor] ? `palette-${entries[cursor].key}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="palette-list" role="listbox" aria-label="Modules">
          {entries.length === 0 && <li className="palette-empty">Nothing matches “{query}”.</li>}
          {entries.map((entry, index) => {
            const Icon = icons[entry.icon];
            return (
              <li key={entry.key} id={`palette-${entry.key}`} role="option" aria-selected={index === cursor}>
                <button
                  type="button"
                  className={index === cursor ? 'active' : ''}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => go(entry)}
                >
                  <Icon size={17} aria-hidden />
                  {entry.title}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="palette-hint">↑↓ to move · Enter to open · Esc to close</p>
      </div>
    </div>
  );
}
