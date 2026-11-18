import { useEffect, useState } from 'react';
import { Activity, Archive, Users, UserRoundCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

const date = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data.data)).catch((error) => toast.error(error.userMessage || 'Could not load dashboard')).finally(() => setLoading(false));
  }, []);
  return <div className="page-wrap">
    <div className="page-heading"><div><p className="eyebrow">TUESDAY, YOUR WORK AT A GLANCE</p><h1>Good to see you, {user?.name?.split(' ')[0]}</h1><p>Here’s what’s happening across your workspace.</p></div><div className="date-pill"><Activity size={16} /> Live overview</div></div>
    <div className="stats-grid">
      <StatCard label="Total users" value={stats?.totalUsers} note="Across your workspace" icon={Users} tone="blue" />
      <StatCard label="Active users" value={stats?.activeUsers} note="Accounts in good standing" icon={UserRoundCheck} tone="green" />
      <StatCard label="Inactive users" value={stats?.inactiveUsers} note="Currently deactivated" icon={Users} tone="amber" />
      <StatCard label="Total records" value={stats?.totalRecords} note="Items in your workspace" icon={Archive} tone="violet" />
    </div>
    <div className="content-grid">
      <section className="panel"><div className="panel-heading"><div><h2>Recent users</h2><p>The latest people to join your workspace</p></div></div>
        <DataTable loading={loading} empty="No users have joined yet" columns={[
          { key: 'name', label: 'Name', render: (row) => <div className="person-cell"><span className="avatar avatar-small">{row.name?.slice(0, 1).toUpperCase()}</span><strong>{row.name}</strong></div> },
          { key: 'role', label: 'Role', render: (row) => <span className="role-text">{row.role}</span> },
          { key: 'status', label: 'Status', render: (row) => <span className={`status-badge ${row.status}`}>{row.status}</span> }
        ]} rows={stats?.recentUsers || []} />
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Recent records</h2><p>Recently updated workspace items</p></div></div>
        <DataTable loading={loading} empty="No records yet. Create your first one." columns={[
          { key: 'title', label: 'Record', render: (row) => <div><strong>{row.title}</strong><div className="muted small-text">{row.category}</div></div> },
          { key: 'price', label: 'Price', render: (row) => `$${Number(row.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
          { key: 'createdAt', label: 'Added', render: (row) => date(row.createdAt) }
        ]} rows={stats?.recentRecords || []} />
      </section>
    </div>
  </div>;
}
