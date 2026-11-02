import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
