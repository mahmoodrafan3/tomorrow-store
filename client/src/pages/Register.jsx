import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const user = await register(name, email, password);
      toast.success(`Welcome to Tomorrow, ${user.name}!`, {
        style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
      });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-decor" />
        <Link to="/" className="auth-visual-logo">Tomorrow</Link>
        <p className="auth-visual-tagline">
          "Style is not about what you wear.<br />It's about who you choose to become."
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <Link to="/" style={{ fontSize: '0.75rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', transition: 'color 300ms ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--black)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray)'}
          >
            ← Back to Home
          </Link>

          <h1 className="auth-form-title">Create account</h1>
          <p className="auth-form-sub">Join Tomorrow — fashion for the future</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '1rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--gray)' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
