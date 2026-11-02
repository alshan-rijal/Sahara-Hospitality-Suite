import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { moduleByKey, type RowAction } from '../lib/moduleConfig';
import { icons } from '../lib/icons';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import FormModal from '../components/FormModal';
import ActionModal from '../components/ActionModal';

const get = (row: any, path: string) => path.split('.').reduce((value, key) => value?.[key], row);
const labelValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(item => typeof item === 'object' ? (item.name || item.code || item._id) : item).join(', ');
  if (typeof value === 'object') return value.name || value.code || value.number || value._id || JSON.stringify(value);
  return String(value);
};

export default function ModulePage() {
  const { moduleKey } = useParams();
  const config = moduleByKey[moduleKey || ''];
  const { can, user } = useAuth();
  const allowed = Boolean(config && can(config.readPermission));
  const endpoint = config?.endpoint || '';
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ open: boolean; row?: any }>({ open: false });
  const [actionState, setActionState] = useState<{ row: any; action: RowAction } | null>(null);

  const load = useCallback(async () => {
    if (!config || !allowed) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoint, { params: { page, limit: 20, search } });
      setRows(data.data || data);
      setMeta(data.meta);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [allowed, config, endpoint, page, search]);

  useEffect(() => {
    if (!config || !allowed) return;
    const timer = window.setTimeout(load, search ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [allowed, config, load, search]);

  useEffect(() => {
    setPage(1);
    setSearch('');
    setRows([]);
    setMeta(undefined);
  }, [moduleKey]);

  const currency = user?.properties?.[0]?.currency || 'GBP';
  const format = (value: any, kind?: string) => {
    if (kind === 'money') return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(value || 0));
    if (kind === 'date' && value) return new Date(value).toLocaleDateString('en-GB');
    if (kind === 'datetime' && value) return new Date(value).toLocaleString('en-GB');
    if (kind === 'boolean') return value ? 'Yes' : 'No';
    if (kind === 'status') return <span className={`status ${String(value)}`}>{labelValue(value).replaceAll('_', ' ')}</span>;
    return labelValue(value);
  };

  const remove = async (row: any) => {
    if (!config || !window.confirm('Delete this record? This action is audited.')) return;
    try {
      await api.delete(`${endpoint}/${row._id}`, { data: { reason: 'Deleted from ERP dashboard' } });
      load();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const runAction = async (row: any, action: RowAction) => {
    if (!config) return;
    if (action.confirm && !window.confirm(action.confirm)) return;
    if (action.prompts?.length) {
      setActionState({ row, action });
      return;
    }
    try {
      await api.post(`${endpoint}${action.path.replace(':id', row._id)}`, action.body || {});
      load();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const canManage = Boolean(config?.managePermission && can(config.managePermission));
  const pages = meta?.pages || 1;
  const subtitle = useMemo(() => meta ? `${meta.total} records · Page ${meta.page} of ${meta.pages}` : `${rows.length} records`, [meta, rows.length]);

  if (!config) return <Navigate to="/" replace />;
  if (!allowed) return <div className="empty-state"><h2>Access denied</h2><p>Your role does not include {config.readPermission}.</p></div>;

  const ModuleIcon = icons[config.icon];
  const showActions = canManage || Boolean(config.actions?.some(action => can(action.permission)));

  return (
    <>
      <div className="module-heading">
        <div>
          <span className="module-icon"><ModuleIcon size={22} strokeWidth={2} aria-hidden /></span>
          <div>
            <h2>{config.title}</h2>
            <p>{config.description}</p>
          </div>
        </div>
        {canManage && !config.readOnly && config.fields && (
          <button onClick={() => setForm({ open: true })}><Plus size={16} aria-hidden /> New record</button>
        )}
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <strong>{subtitle}</strong>
            <span>Signed in as {user?.role.name}</span>
          </div>
          <div className="search-wrap">
            <Search size={16} aria-hidden />
            <input
              className="search"
              placeholder={`Search ${config.title.toLowerCase()}…`}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
        </div>
        {error && <div className="alert error">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {config.columns.map(column => <th key={column.key}>{column.label}</th>)}
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={config.columns.length + (showActions ? 1 : 0)}><div className="skeleton" style={{ height: 18 }} /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + (showActions ? 1 : 0)}>
                    <div className="empty-state small">
                      <h3>No {config.title.toLowerCase()} found</h3>
                      <p>{search ? 'Try a different search term.' : 'Create the first record to get started.'}</p>
                    </div>
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row._id}>
                  {config.columns.map(column => <td key={column.key}>{format(get(row, column.key), column.format)}</td>)}
                  {showActions && (
                    <td>
                      <div className="row-actions">
                        {config.actions?.filter(action => can(action.permission) && (!action.showWhen || action.showWhen(row))).map(action => (
                          <button key={action.label} className={action.className || 'secondary'} onClick={() => runAction(row, action)}>{action.label}</button>
                        ))}
                        {canManage && !config.readOnly && config.fields && <button className="secondary" onClick={() => setForm({ open: true, row })}>Edit</button>}
                        {canManage && !config.readOnly && !['users', 'roles'].includes(config.key) && <button className="danger" onClick={() => remove(row)}>Delete</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="pagination">
            <button className="secondary" disabled={page <= 1} onClick={() => setPage(current => current - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="secondary" disabled={page >= pages} onClick={() => setPage(current => current + 1)}>Next</button>
          </div>
        )}
      </section>
      {form.open && config.fields && (
        <FormModal
          title={`${form.row ? 'Edit' : 'New'} ${config.title}`}
          fields={config.fields}
          initial={form.row}
          endpoint={endpoint}
          onClose={() => setForm({ open: false })}
          onSaved={load}
        />
      )}
      {actionState && (
        <ActionModal
          title={actionState.action.label}
          endpoint={`${endpoint}${actionState.action.path.replace(':id', actionState.row._id)}`}
          fields={actionState.action.prompts || []}
          baseBody={actionState.action.body}
          onClose={() => setActionState(null)}
          onSaved={load}
        />
      )}
    </>
  );
}
