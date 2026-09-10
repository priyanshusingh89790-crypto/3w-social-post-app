import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import '../styles/auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Left — editorial brand panel */}
      <div className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-logo">
          <div className="auth-brand-3w">3W</div>
          <div className="auth-brand-social">Social</div>
        </div>

        <div className="auth-brand-statement">
          <h2 className="auth-brand-heading">
            Share what&apos;s<br />
            <em>worth sharing.</em>
          </h2>
          <p className="auth-brand-subtext">
            A minimal space for people who have something to say.
            No noise. Just words and images that matter.
          </p>
        </div>

        <p className="auth-brand-footer">3W Social · {new Date().getFullYear()}</p>
      </div>

      {/* Right — form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {/* Mobile brand (hidden on desktop via CSS) */}
          <div className="auth-mobile-brand">
            <div className="auth-brand-3w">3W</div>
            <div className="auth-brand-social">Social</div>
          </div>

          <h1 className="auth-form-heading">Welcome back</h1>
          <p className="auth-form-sub">Sign in to continue</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword
                    ? <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
                    : <Eye size={16} strokeWidth={1.75} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner spinner--sm" aria-hidden="true" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-footer-link">
            Don&apos;t have an account?{' '}
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
