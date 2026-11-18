import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPassword } from '../utils/validation';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Your name is required';
    if (!isValidEmail(values.email)) next.email = 'Enter a valid email address';
    if (!isValidPassword(values.password)) next.password = 'Use 8+ characters with at least one letter and number';
    if (values.password !== values.confirmPassword) next.confirmPassword = 'Passwords do not match';
    return next;
  };
  const submit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const { confirmPassword, ...details } = values;
      await register(details);
      toast.success('Your account is ready');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.userMessage || 'Unable to create account');
    } finally { setBusy(false); }
  };
  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-brand"><span className="brand-mark">N</span><span className="brand-name">northstar</span></div>
      <div className="auth-heading"><p className="eyebrow">GET STARTED</p><h1>Create your account</h1><p>Join your team and bring your work together.</p></div>
      <form className="form-stack" onSubmit={submit} noValidate>
        <label>Full name<input autoComplete="name" placeholder="Jordan Lee" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />{errors.name && <small className="field-error">{errors.name}</small>}</label>
        <label>Email address<input type="email" autoComplete="email" placeholder="you@company.com" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
        <label>Password<span className="input-with-action"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} /><button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{errors.password && <small className="field-error">{errors.password}</small>}</label>
        <label>Confirm password<input type="password" autoComplete="new-password" placeholder="Re-enter your password" value={values.confirmPassword} onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })} />{errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}</label>
        <button className="btn btn-primary btn-wide" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </div><p className="auth-footnote">A calmer way to manage your work.</p></div>
  );
}
