import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return ['admin', 'manager'].includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
