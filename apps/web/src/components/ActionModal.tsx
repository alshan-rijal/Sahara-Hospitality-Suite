import { useState } from 'react';
import Modal from './Modal';
import type { PromptField } from '../lib/moduleConfig';
import { api, errorMessage } from '../lib/api';

export default function ActionModal({ title, endpoint, fields, baseBody, onClose, onSaved }: {
  title: string;
  endpoint: string;
  fields: PromptField[];
  baseBody?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(fields.map(field => [field.name, field.defaultValue ?? (field.type === 'boolean' ? false : '')]))
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body: Record<string, any> = { ...baseBody };
      for (const field of fields) {
        let value = values[field.name];
        if (field.type === 'number' && value !== '') value = Number(value);
        body[field.name] = value;
      }
      await api.post(endpoint, body);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          {fields.map(field => (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.type === 'select' ? (
                <select value={values[field.name]} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}>
                  <option value="">Select…</option>
                  {field.options?.map(option => <option value={option.value} key={String(option.value)}>{option.label}</option>)}
                </select>
              ) : field.type === 'boolean' ? (
                <input className="check" type="checkbox" checked={values[field.name]} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.checked }))} />
              ) : (
                <input type={field.type === 'number' ? 'number' : 'text'} value={values[field.name]} placeholder={field.label} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} />
              )}
            </label>
          ))}
        </div>
        {error && <div className="alert error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button disabled={saving}>{saving ? 'Working…' : 'Confirm'}</button>
        </div>
      </form>
    </Modal>
  );
}
