import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEscape, useFocusTrap, useScrollLock } from '../lib/hooks';

/** Accessible dialog: focus is trapped, Esc closes, and body scroll is locked. */
export default function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEscape(onClose, true);
  useScrollLock(true);
  useFocusTrap(ref, true);

  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={18} aria-hidden /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
