import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { moduleByKey, type RowAction } from '../lib/moduleConfig';
import { icons } from '../lib/icons';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../lib/seo';
import FormModal from '../components/FormModal';
import ActionModal from '../components/ActionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import CopyButton from '../components/CopyButton';

const get = (row: any, path: string) => path.split('.').reduce((value, key) => value?.[key], row);
const labelValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(item => typeof item === 'object' ? (item.name || item.code || item._id) : item).join(', ');
  if (typeof value === 'object') return value.name || value.code || value.number || value._id || JSON.stringify(value);
  return String(value);
};

/** Columns whose values are references people copy out of the app. */
const COPYABLE = new Set(['confirmationNumber', 'folioNumber', 'number', 'orderNumber', 'eventNumber', 'sku', 'employeeCode', 'entityId', 'email']);

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
  const [confirmState, setConfirmState] = useState<{ title: string; message: string; confirmLabel?: string; tone?: 'default' | 'danger'; run: () => Promise<void> | void } | null>(null);
  const [flash, setFlash] = useState('');

  useSeo({
    title: `${config?.title ?? 'Module'} | Hotel Operations`,
    description: config?.description ?? 'Hotel operations module.',
    path: `/module/${moduleKey ?? ''}`,
    noindex: true
  });

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
    setFlash('');
  }, [moduleKey]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(''), 4000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const currency = user?.properties?.[0]?.currency || 'GBP';
  const format = (value: any, kind?: string) => {
    if (kind === 'money') return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(value || 0));
    if (kind === 'date' && value) return new Date(value).toLocaleDateString('en-GB');
    if (kind === 'datetime' && value) return new Date(value).toLocaleString('en-GB');
    if (kind === 'boolean') return value ? 'Yes' : 'No';
    if (kind === 'status') return <span className={`status ${String(value)}`}>{labelValue(value).replaceAll('_', ' ')}</span>;
    return labelValue(value);
  };

  const remove = (row: any) => {
    if (!config) return;
    setConfirmState({
      title: 'Delete record',
      message: `Delete this ${config.title.toLowerCase()} permanently? The change is written to the audit log and cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      run: async () => {
        await api.delete(`${endpoint}/${row._id}`, { data: { reason: 'Deleted from the app' } });
        setFlash('Record deleted. The removal is in the audit log.');
        await load();
      }
    });
  };

  const runAction = (row: any, action: RowAction) => {
    if (!config) return;
    const direct = async () => {
      await api.post(`${endpoint}${action.path.replace(':id', row._id)}`, action.body || {});
      setFlash(`${action.label} completed.`);
      await load();
    };
    if (action.prompts?.length) {
      if (action.confirm) setConfirmState({ title: action.label, message: action.confirm, confirmLabel: action.label, tone: action.className === 'danger' ? 'danger' : 'default', run: () => setActionState({ row, action }) });
      else setActionState({ row, action });
      return;
    }
    if (action.confirm) {
      setConfirmState({ title: action.label, message: action.confirm, confirmLabel: action.label, tone: action.className === 'danger' ? 'danger' : 'default', run: direct });
      return;
    }
    direct().catch(err => setError(errorMessage(err)));
  };

  const done = useCallback((message: string) => { setFlash(message); void load(); }, [load]);

  const canManage = Boolean(config?.managePermission && can(config.managePermission));
  const pages = meta?.pages || 1;
  const subtitle = useMemo(() => meta ? `${meta.total} records · Page ${meta.page} of ${meta.pages}` : `${rows.length} records`, [meta, rows.length]);

  if (!config) return <Navigate to="/" replace />;
  if (!allowed) {
    return (
      <>
        <h1 className="sr-only">{config.title}</h1>
        <EmptyState art="access" title="Access denied" description={`Your role does not include the ${config.readPermission} permission, so this module is hidden from your workspace.`} />
      </>
    );
  }

  const ModuleIcon = icons[config.icon];
  const showActions = canManage || Boolean(config.actions?.some(action => can(action.permission)));
  const colCount = config.columns.length + (showActions ? 1 : 0);
  const singular = config.title.toLowerCase().replace(/s$/, '');

  return (
    <>
      <div className="module-heading">
        <div>
          <span className="module-icon"><ModuleIcon size={22} strokeWidth={2} aria-hidden /></span>
          <div>
            <h1>{config.title}</h1>
            <p>{config.description}</p>
          </div>
        </div>
        {canManage && !config.readOnly && config.fields && (
          <button onClick={() => setForm({ open: true })}><Plus size={16} aria-hidden /> New {singular}</button>
        )}
      </div>

      {error && (
        <div className="alert error" role="alert">
          <span>{error}</span>
          <button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><X size={15} aria-hidden /></button>
        </div>
      )}
      {flash && (
        <div className="alert success" role="status">
          <span>{flash}</span>
          <button className="icon-button" aria-label="Dismiss message" onClick={() => setFlash('')}><X size={15} aria-hidden /></button>
        </div>
      )}

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
              type="search"
              placeholder={`Search ${config.title.toLowerCase()}…`}
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label={`Search ${config.title}`}
            />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {config.columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}
                {showActions && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="skeleton-row">
                    <td colSpan={colCount}><div className="skeleton" style={{ height: 16 }} /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={colCount}>
                    {search ? (
                      <EmptyState small art="search" title={`No ${config.title.toLowerCase()} match “${search}”`} description="Try a shorter search term or clear the search box." action={<button className="secondary" onClick={() => setSearch('')}>Clear search</button>} />
                    ) : (
                      <EmptyState
                        small
                        title={`No ${config.title.toLowerCase()} yet`}
                        description={config.readOnly ? 'Records will appear here as the team creates them.' : `Add the first ${singular} to get this module moving.`}
                        action={canManage && !config.readOnly && config.fields
                          ? <button onClick={() => setForm({ open: true })}><Plus size={16} aria-hidden /> New {singular}</button>
                          : undefined}
                      />
                    )}
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row._id}>
                  {config.columns.map(column => {
                    const raw = get(row, column.key);
                    const text = labelValue(raw);
                    const copyable = COPYABLE.has(column.key) && text !== '—';
                    return (
                      <td key={column.key}>
                        {copyable
                          ? <span className="copy-cell"><span>{format(raw, column.format)}</span><CopyButton value={text} /></span>
                          : format(raw, column.format)}
                      </td>
                    );
                  })}
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
          onSaved={() => done(form.row ? 'Changes saved.' : 'Record created — it is now at the top of the list.')}
        />
      )}
      {actionState && (
        <ActionModal
          title={actionState.action.label}
          endpoint={`${endpoint}${actionState.action.path.replace(':id', actionState.row._id)}`}
          fields={actionState.action.prompts || []}
          baseBody={actionState.action.body}
          onClose={() => setActionState(null)}
          onSaved={() => done(`${actionState.action.label} completed.`)}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          tone={confirmState.tone}
          onConfirm={confirmState.run}
          onClose={() => setConfirmState(null)}
        />
      )}
    </>
  );
}
