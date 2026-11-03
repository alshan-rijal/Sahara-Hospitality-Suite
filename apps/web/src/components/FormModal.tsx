import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import PasswordInput from './PasswordInput';
import type { FieldConfig, FieldOption } from '../lib/moduleConfig';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const idOf = (value: any) => value && typeof value === 'object' ? value._id : value ?? '';

/** Fields that must reach the API as an array of strings (multi-selects, CSV lists, *Ids fields). */
const isIdArray = (field: FieldConfig) => field.type === 'multi-property' || field.type === 'csv' || field.name.endsWith('Ids');
const toArray = (value: any) => (Array.isArray(value) ? value : String(value ?? '').split(',')).map(item => String(item).trim()).filter(Boolean);

export default function FormModal({ title, fields, initial, onClose, onSaved, endpoint }: {
  title: string;
  fields: FieldConfig[];
  initial?: any;
  onClose: () => void;
  onSaved: () => void;
  endpoint: string;
}) {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, any>>({});
  const [options, setOptions] = useState<Record<string, FieldOption[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const start: Record<string, any> = {};
    for (const field of fields) {
      let value = initial?.[field.name] ?? field.defaultValue ?? (field.type === 'boolean' ? false : '');
      if (field.type === 'date' && value) value = new Date(value).toISOString().slice(0, 10);
      if (field.type === 'datetime-local' && value) value = new Date(value).toISOString().slice(0, 16);
      if (field.type === 'csv' && Array.isArray(value)) value = value.join(', ');
      if (field.type === 'json' && typeof value !== 'string') value = JSON.stringify(value ?? [], null, 2);
      if (field.type === 'select') value = idOf(value);
      if (field.type === 'multi-property') value = Array.isArray(value) ? value.map(idOf) : (value ? [idOf(value)] : []);
      start[field.name] = value;
    }
    setValues(start);
  }, [fields, initial]);

  useEffect(() => {
    for (const field of fields) {
      if (!field.remoteEndpoint) continue;
      if (field.remoteEndpoint === '__properties') {
        setOptions(current => ({
          ...current,
          [field.name]: (user?.properties || []).map(property => ({ value: property._id, label: `${property.code} — ${property.name}` }))
        }));
        continue;
      }
      const remoteEndpoint = field.remoteEndpoint;
      api.get(remoteEndpoint)
        .then(({ data }) => {
          const rows = data.data || data;
          setOptions(current => ({
            ...current,
            [field.name]: rows.map((row: any) => ({
              value: row._id,
              label: (field.remoteLabel || ['name']).map(key => row[key]).filter(Boolean).join(' · ') || row._id
            }))
          }));
        })
        .catch(() => setOptions(current => ({ ...current, [field.name]: [] })));
    }
  }, [fields, user]);

  const isEdit = Boolean(initial?._id);
  const propertyOptions = useMemo(() => (user?.properties || []).map(property => ({
    value: property._id,
    label: `${property.code} — ${property.name}`
  })), [user]);

  const setField = (name: string, value: any) => {
    setValues(current => ({ ...current, [name]: value }));
    setFieldErrors(current => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  /** Friendly, field-level checks that run before the request is sent. */
  const validate = () => {
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const value = values[field.name];
      const empty = value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
      if (field.required && empty) { errors[field.name] = `${field.label} is required.`; continue; }
      if (empty) continue;
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) errors[field.name] = 'Enter a valid email address, like name@hotel.com.';
      if (field.type === 'number' && Number.isNaN(Number(value))) errors[field.name] = 'Enter a number.';
      if (field.type === 'password' && String(value).length > 0 && String(value).length < 8) errors[field.name] = 'Use at least 8 characters.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    setSaving(true);
    try {
      const body: Record<string, any> = {};
      for (const field of fields) {
        let value = values[field.name];
        if (field.type === 'number' && value !== '') value = Number(value);
        if (isIdArray(field)) value = toArray(value);
        if (field.type === 'json') value = JSON.parse(value || '[]');
        if ((field.type === 'date' || field.type === 'datetime-local') && value) value = new Date(value).toISOString();
        if (value === '' && !field.required) continue;
        body[field.name] = value;
      }
      if (isEdit) await api.put(`${endpoint}/${initial._id}`, body);
      else await api.post(endpoint, body);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const describedBy = (field: FieldConfig) => fieldErrors[field.name] ? `error-${field.name}` : undefined;
  const inputProps = (field: FieldConfig) => ({ 'aria-invalid': Boolean(fieldErrors[field.name]), 'aria-describedby': describedBy(field) });
  const errorNote = (field: FieldConfig) => fieldErrors[field.name] ? <small className="field-error" id={`error-${field.name}`} role="alert">{fieldErrors[field.name]}</small> : null;

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {fields.map(field => (
            <label key={field.name} className={field.type === 'textarea' || field.type === 'json' ? 'full' : ''}>
              <span>{field.label}{field.required ? ' *' : ''}</span>
              {field.type === 'textarea' || field.type === 'json' ? (
                <textarea rows={field.type === 'json' ? 7 : 3} value={values[field.name] ?? ''} placeholder={field.placeholder} onChange={event => setField(field.name, event.target.value)} {...inputProps(field)} />
              ) : field.type === 'select' ? (
                <select value={values[field.name] ?? ''} onChange={event => setField(field.name, event.target.value)} {...inputProps(field)}>
                  <option value="">Select…</option>
                  {(field.options || options[field.name] || []).map(option => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
                </select>
              ) : field.type === 'multi-property' ? (
                <select multiple value={values[field.name] || []} onChange={event => setField(field.name, Array.from(event.target.selectedOptions).map(option => option.value))} {...inputProps(field)}>
                  {propertyOptions.map(option => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
                </select>
              ) : field.type === 'boolean' ? (
                <input className="check" type="checkbox" checked={Boolean(values[field.name])} onChange={event => setField(field.name, event.target.checked)} />
              ) : field.type === 'password' ? (
                <PasswordInput value={values[field.name] ?? ''} onChange={value => setField(field.name, value)} placeholder={field.placeholder} autoComplete="new-password" name={field.name} />
              ) : (
                <input type={field.type || 'text'} value={values[field.name] ?? ''} placeholder={field.placeholder} onChange={event => setField(field.name, event.target.value)} {...inputProps(field)} />
              )}
              {errorNote(field)}
            </label>
          ))}
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button disabled={saving}>
            {saving && <Spinner />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
