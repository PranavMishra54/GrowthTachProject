import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';

export default function AdminLogin() {
  const { user, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={['admin', 'manager'].includes(user.role) ? '/admin' : '/dashboard'} replace />;
  const submit = async (event) => {
    event.preventDefault();
    if (!isValidEmail(values.email) || !values.password) {
      toast.error('Enter a valid email and password');
      return;
    }
    setBusy(true);
    try {
      await adminLogin(values);
      toast.success('Administrator access granted');
      navigate('/admin');
    } catch (error) { toast.error(error.userMessage || 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand"><span className="brand-mark">N</span><span className="brand-name">northstar</span></div>
    <div className="auth-heading"><p className="eyebrow">CONTROL CENTER</p><h1>Admin sign in</h1><p>Sign in with an administrator account.</p></div>
    <form className="form-stack" onSubmit={submit}><label>Email address<input type="email" autoComplete="username" placeholder="admin@company.com" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required /></label><label>Password<input type="password" autoComplete="current-password" placeholder="Your password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required /></label><button className="btn btn-primary btn-wide" disabled={busy}>{busy ? 'Signing in…' : 'Continue to admin'}</button></form>
    <p className="auth-switch"><Link to="/login">Back to standard sign in</Link></p>
  </div><p className="auth-footnote">Administrator access is limited to authorized roles.</p></div>;
}
