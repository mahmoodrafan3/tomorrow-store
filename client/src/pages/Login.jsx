import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`, {
        style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
      });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual Side */}
      <div className="auth-visual">
        <div className="auth-visual-decor" />
        <Link to="/" className="auth-visual-logo">Tomorrow</Link>
        <p className="auth-visual-tagline">
          "The future belongs to those<br />who dress for it."
        </p>
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '0.5rem',
        }}>
          {['Minimal', 'Luxury', 'Timeless'].map((t) => (
            <span key={t} className="badge badge-cream" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(245,240,232,0.6)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          <Link to="/" style={{ fontSize: '0.75rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', transition: 'color 300ms ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--black)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray)'}
          >
            ← Back to Home
          </Link>

          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-sub">Sign in to your Tomorrow account</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '1rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--gray)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
