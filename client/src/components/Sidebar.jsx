import { LayoutDashboard, Package, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const admin = ['admin', 'manager'].includes(user?.role);
  return (
    <>
      <div className={`sidebar-overlay${open ? ' visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="brand-row"><span className="brand-mark">N</span><span className="brand-name">northstar</span><button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to="/dashboard" onClick={onClose}><LayoutDashboard size={18} />Overview</NavLink>
          <NavLink to="/records" onClick={onClose}><Package size={18} />Records</NavLink>
          {admin && <><div className="nav-caption nav-caption-admin">MANAGEMENT</div><NavLink to="/admin" onClick={onClose}><LayoutDashboard size={18} />Admin dashboard</NavLink><NavLink to="/admin/users" onClick={onClose}><Users size={18} />Users</NavLink></>}
        </nav>
        <div className="sidebar-footer"><div className="help-dot">?</div><div><strong>Need a hand?</strong><span>Contact your workspace admin</span></div></div>
      </aside>
    </>
  );
}
