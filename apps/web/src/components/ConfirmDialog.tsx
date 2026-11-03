import { useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';

/** Accessible confirmation dialog for destructive or irreversible actions. */
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', tone = 'default', onConfirm, onClose }: {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirm-body">
        <p>{message}</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={tone === 'danger' ? 'danger' : ''} onClick={confirm} disabled={busy}>
            {busy && <Spinner />}
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
