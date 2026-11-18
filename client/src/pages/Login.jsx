import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!isValidEmail(values.email)) next.email = 'Enter a valid email address';
    if (!values.password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await login(values);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.userMessage || 'Unable to sign in');
    } finally { setBusy(false); }
  };
  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-brand"><span className="brand-mark">N</span><span className="brand-name">northstar</span></div>
      <div className="auth-heading"><p className="eyebrow">YOUR WORKSPACE, IN FOCUS</p><h1>Welcome back</h1><p>Sign in to continue to your workspace.</p></div>
      <form className="form-stack" onSubmit={submit} noValidate>
        <label>Email address<input type="email" autoComplete="email" placeholder="you@company.com" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
        <label>Password<input type="password" autoComplete="current-password" placeholder="Enter your password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />{errors.password && <small className="field-error">{errors.password}</small>}</label>
        <button className="btn btn-primary btn-wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="auth-switch">New to Northstar? <Link to="/register">Create an account</Link></p>
      <Link className="admin-login-link" to="/admin/login">Administrator sign in</Link>
    </div><p className="auth-footnote">A calmer way to manage your work.</p></div>
  );
}
