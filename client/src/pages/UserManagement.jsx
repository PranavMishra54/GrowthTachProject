import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { isValidEmail, isValidPassword } from '../utils/validation';

const emptyForm = { name: '', email: '', password: '', role: 'user', status: 'active' };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page: pagination.page, limit: 10, search, status: statusFilter || undefined, role: roleFilter || undefined } });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (error) { toast.error(error.userMessage || 'Could not load users'); }
    finally { setLoading(false); }
  }, [pagination.page, search, statusFilter, roleFilter]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPagination((current) => ({ ...current, page: 1 })); }, [search, statusFilter, roleFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModal(true); };
  const openEdit = (record) => { setEditing(record); setForm({ name: record.name, email: record.email, password: '', role: record.role, status: record.status }); setErrors({}); setModal(true); };
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
    if ((!editing || form.password) && !isValidPassword(form.password)) next.password = 'Use 8+ characters with a letter and number';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) await api.put(`/users/${editing._id}`, payload);
      else await api.post('/users', payload);
      toast.success(editing ? 'User updated' : 'User created');
      setModal(false);
      await load();
    } catch (error) { toast.error(error.userMessage || 'Could not save user'); }
    finally { setBusy(false); }
  };
  const changeUser = async (target, updates) => {
    try { await api.put(`/users/${target._id}`, updates); toast.success('User access updated'); await load(); }
    catch (error) { toast.error(error.userMessage || 'Could not update user'); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/users/${deleting._id}`); toast.success('User deleted'); setDeleting(null); await load(); }
    catch (error) { toast.error(error.userMessage || 'Could not delete user'); }
    finally { setBusy(false); }
  };
  const columns = [
    { key: 'name', label: 'User', render: (row) => <div className="person-cell"><span className="avatar avatar-small">{row.name?.slice(0, 1).toUpperCase()}</span><div><strong>{row.name}</strong><div className="muted small-text">{row.email}</div></div></div> },
    { key: 'role', label: 'Role', render: (row) => isAdmin ? <select className="inline-select" value={row.role} disabled={row._id === currentUser.id} onChange={(e) => changeUser(row, { role: e.target.value })} aria-label={`Role for ${row.name}`}><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select> : <span className="role-text">{row.role}</span> },
    { key: 'status', label: 'Status', render: (row) => <span className={`status-badge ${row.status}`}>{row.status}</span> },
    { key: 'createdAt', label: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) },
    { key: 'actions', label: 'Actions', render: (row) => <div className="row-actions"><button className="text-button" onClick={() => setViewing(row)}>View</button>{isAdmin && <><button className="text-button" onClick={() => openEdit(row)}>Edit</button>{row._id !== currentUser.id && <><button className="text-button" onClick={() => changeUser(row, { status: row.status === 'active' ? 'inactive' : 'active' })}>{row.status === 'active' ? 'Deactivate' : 'Activate'}</button><button className="text-button danger-text" onClick={() => setDeleting(row)}>Delete</button></>}</>}</div> }
  ];
  return <div className="page-wrap">
    <div className="page-heading"><div><p className="eyebrow">PEOPLE & ACCESS</p><h1>User management</h1><p>Manage workspace members, roles, and account access.</p></div>{isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={17} /> Add user</button>}</div>
    <section className="panel records-panel">
      <div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" /></div><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role"><option value="">All roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="user">User</option></select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><span className="result-count">{pagination.total} members</span></div>
      <DataTable columns={columns} rows={users} loading={loading} empty="No users match your filters." />
      <div className="pagination"><span>Page {pagination.page} of {Math.max(pagination.pages, 1)}</span><div><button className="btn btn-outline btn-sm" disabled={pagination.page <= 1 || loading} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>Previous</button><button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.pages || loading} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next</button></div></div>
    </section>
    <Modal open={modal} title={editing ? 'Edit user' : 'Add a user'} onClose={() => setModal(false)}>
      <form className="form-stack modal-form" onSubmit={submit} noValidate>
        <label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <small className="field-error">{errors.name}</small>}</label>
        <label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
        <label>{editing ? 'New password (optional)' : 'Password'}<input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8+ characters, letters and numbers" />{errors.password && <small className="field-error">{errors.password}</small>}</label>
        <div className="form-row"><label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
        <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create user'}</button></div>
      </form>
    </Modal>
    <Modal open={Boolean(viewing)} title="User details" onClose={() => setViewing(null)}>
      {viewing && <div className="detail-list"><div className="detail-person"><span className="avatar">{viewing.name?.slice(0, 1).toUpperCase()}</span><div><strong>{viewing.name}</strong><span>{viewing.email}</span></div></div><div><span>Role</span><strong>{viewing.role}</strong></div><div><span>Status</span><span className={`status-badge ${viewing.status}`}>{viewing.status}</span></div><div><span>Joined</span><strong>{new Date(viewing.createdAt).toLocaleDateString()}</strong></div><div><span>Last sign in</span><strong>{viewing.lastLogin ? new Date(viewing.lastLogin).toLocaleString() : 'Never'}</strong></div></div>}
    </Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Delete this user?" message={`The account for ${deleting?.name} will be permanently deleted.`} onCancel={() => setDeleting(null)} onConfirm={remove} busy={busy} />
  </div>;
}
