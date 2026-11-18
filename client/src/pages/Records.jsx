import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const blank = { title: '', description: '', category: '', price: '', status: 'active' };
const money = (value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export default function Records() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/records', { params: { page: pagination.page, limit: 8, search, status: filter || undefined, ...sort } });
      setRows(data.data.records);
      setPagination(data.data.pagination);
    } catch (error) { toast.error(error.userMessage || 'Could not load records'); }
    finally { setLoading(false); }
  }, [pagination.page, search, filter, sort]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const timer = setTimeout(() => setPagination((current) => ({ ...current, page: 1 })), 0); return () => clearTimeout(timer); }, [search, filter]);

  const openNew = () => { setEditing(null); setForm(blank); setErrors({}); setModal(true); };
  const openEdit = (record) => { setEditing(record); setForm({ title: record.title, description: record.description || '', category: record.category, price: String(record.price), status: record.status }); setErrors({}); setModal(true); };
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.category.trim()) next.category = 'Category is required';
    if (form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) next.price = 'Enter a valid non-negative price';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const body = { ...form, price: Number(form.price) };
      if (editing) await api.put(`/records/${editing._id}`, body);
      else await api.post('/records', body);
      toast.success(editing ? 'Record updated' : 'Record created');
      setModal(false);
      await load();
    } catch (error) { toast.error(error.userMessage || 'Could not save record'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/records/${deleting._id}`); toast.success('Record deleted'); setDeleting(null); await load(); }
    catch (error) { toast.error(error.userMessage || 'Could not delete record'); }
    finally { setBusy(false); }
  };
  const toggleSort = (field) => setSort((current) => ({ sortBy: field, sortOrder: current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc' }));
  const columns = [
    { key: 'title', label: 'Title', sortable: true, render: (row) => <div><strong>{row.title}</strong><div className="muted small-text truncate">{row.description || 'No description'}</div></div> },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true, render: (row) => money(row.price) },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <span className={`status-badge ${row.status}`}>{row.status}</span> },
    { key: 'actions', label: 'Actions', render: (row) => <div className="row-actions"><button className="text-button" onClick={() => openEdit(row)}>Edit</button><button className="text-button danger-text" onClick={() => setDeleting(row)}>Delete</button></div> }
  ];

  return <div className="page-wrap">
    <div className="page-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Records</h1><p>Manage and organize your workspace items.</p></div><button className="btn btn-primary" onClick={openNew}><Plus size={17} /> Add record</button></div>
    <section className="panel records-panel">
      <div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search records..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search records" />{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</div><select aria-label="Filter by status" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><span className="result-count">{pagination.total} records</span></div>
      <DataTable columns={columns} rows={rows} loading={loading} sortBy={sort.sortBy} sortOrder={sort.sortOrder} onSort={toggleSort} empty="No records match your search." />
      <div className="pagination"><span>Page {pagination.page} of {Math.max(pagination.pages, 1)}</span><div><button className="btn btn-outline btn-sm" disabled={pagination.page <= 1 || loading} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>Previous</button><button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.pages || loading} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next</button></div></div>
    </section>
    <Modal open={modal} title={editing ? 'Edit record' : 'Create a record'} onClose={() => setModal(false)}>
      <form className="form-stack modal-form" onSubmit={submit} noValidate>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Studio headphones" />{errors.title && <small className="field-error">{errors.title}</small>}</label>
        <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" />{errors.category && <small className="field-error">{errors.category}</small>}</label>
        <label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />{errors.price && <small className="field-error">{errors.price}</small>}</label>
        <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <label>Description<textarea rows="3" maxLength="2000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a short description" /></label>
        <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create record'}</button></div>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(deleting)} message={`“${deleting?.title}” will be permanently removed.`} onCancel={() => setDeleting(null)} onConfirm={remove} busy={busy} />
  </div>;
}
