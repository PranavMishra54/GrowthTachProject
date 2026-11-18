import { useEffect, useState } from 'react';
import { Archive, ShieldCheck, UserRoundCheck, Users } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/client';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';

const COLORS = ['#5969e8', '#22a06b', '#e7a23b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/dashboard/stats').then(({ data }) => setStats(data.data)).catch((error) => toast.error(error.userMessage || 'Could not load admin overview')).finally(() => setLoading(false)); }, []);
  const chartData = ['admin', 'manager', 'user'].map((role) => ({ name: role, value: stats?.usersByRole?.find((item) => item._id === role)?.count || 0 })).filter((item) => item.value > 0);
  return <div className="page-wrap">
    <div className="page-heading"><div><p className="eyebrow">CONTROL CENTER</p><h1>Admin dashboard</h1><p>Workspace health and team activity at a glance.</p></div><div className="date-pill"><ShieldCheck size={16} /> Admin portal</div></div>
    <div className="stats-grid">
      <StatCard label="Total users" value={stats?.totalUsers} note="All registered accounts" icon={Users} tone="blue" />
      <StatCard label="Active users" value={stats?.activeUsers} note="Currently able to sign in" icon={UserRoundCheck} tone="green" />
      <StatCard label="Inactive users" value={stats?.inactiveUsers} note="Access currently paused" icon={Users} tone="amber" />
      <StatCard label="Total records" value={stats?.totalRecords} note="Across the workspace" icon={Archive} tone="violet" />
    </div>
    <div className="admin-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h2>Users by role</h2><p>How access is distributed</p></div></div>
        {loading ? <div className="chart-empty">Loading chart…</div> : chartData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={4}>{chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="chart-legend">{chartData.map((item, index) => <span key={item.name}><i style={{ backgroundColor: COLORS[index] }} />{item.name}<strong>{item.value}</strong></span>)}</div></div> : <div className="chart-empty">No user data to chart yet.</div>}
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Recently added</h2><p>Latest workspace members</p></div></div>
        <DataTable loading={loading} empty="No users yet" columns={[
          { key: 'name', label: 'Name', render: (row) => <div className="person-cell"><span className="avatar avatar-small">{row.name?.slice(0, 1).toUpperCase()}</span><strong>{row.name}</strong></div> },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (row) => <span className="role-text">{row.role}</span> }
        ]} rows={stats?.recentUsers || []} />
      </section>
    </div>
  </div>;
}
