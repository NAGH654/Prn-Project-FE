import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading, authError, setAuthError, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.registered ? 'Account created! Please sign in.' : null
  );

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  useEffect(() => {
    return () => {
      setAuthError(null);
    };
  }, [setAuthError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    if (!form.username || !form.password) {
      setLocalError('Please fill in both username and password');
      return;
    }
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (error) {
      setLocalError(error.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue grading assignments</p>

        {successMessage && <div className="auth-alert success">{successMessage}</div>}
        {(localError || authError) && (
          <div className="auth-alert error">{localError || authError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">
            Username
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. examiner01"
              autoComplete="username"
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="auth-submit" disabled={authLoading}>
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

