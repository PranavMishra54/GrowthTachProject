import { LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = location.pathname.startsWith('/admin/users') ? 'Users'
    : location.pathname.startsWith('/admin') ? 'Admin dashboard'
      : location.pathname.startsWith('/records') ? 'Records' : 'Overview';
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You are signed out');
      navigate('/login');
    } catch (error) {
      toast.error(error.userMessage || 'Could not sign out');
    }
  };
  return (
    <header className="topbar">
      <button className="icon-btn menu-toggle" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button>
      <div className="breadcrumb">Workspace <span>/</span> <strong>{pageName}</strong></div>
      <div className="topbar-right"><div className="user-chip"><div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div><div className="user-chip-copy"><strong>{user?.name}</strong><span>{user?.role}</span></div></div><button className="icon-btn logout-btn" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    </header>
  );
}
