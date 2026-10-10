import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { admin, adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  // Already signed in? Go straight to the console.
  useEffect(() => {
    if (admin) navigate('/admin', { replace: true });
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const account = await adminLogin(email, password);
      toast.success(`Admin session started for ${account.name}`, {
        style: {
          fontFamily: 'var(--font-sans)',
          background: 'var(--black)',
          color: 'var(--cream)',
          borderRadius: '4px',
        },
      });
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-grid" />

      <div className="admin-login-card">
        <div className="admin-login-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Restricted Area
        </div>

        <h1 className="admin-login-title">Admin Console</h1>
        <p className="admin-login-sub">
          Sign in with your administrator credentials. Storefront accounts cannot access this panel.
        </p>

        <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="admin-login-field">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tomorrow.com"
              required
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Verifying…' : 'Enter Console'}
          </button>
        </form>

        <a href="/" className="admin-login-back">
          ← Return to storefront
        </a>
      </div>
    </div>
  );
}
