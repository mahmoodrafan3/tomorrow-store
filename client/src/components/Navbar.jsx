import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';

export default function Navbar({ dark = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navClass = `navbar${scrolled ? ' scrolled' : ''}`;
  const textColor = 'var(--cream)';

  return (
    <>
      <nav className={navClass}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" style={{ color: textColor }}>
            Tomorrow
          </Link>

          <ul className="nav-links">
            {[
              { to: '/',       label: 'Home' },
              { to: '/shop',   label: 'Shop' },
              { to: '/shop?category=Hoodies', label: 'Hoodies' },
              { to: '/shop?category=Blazers', label: 'Blazers' },
            ].map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  style={{ color: textColor }}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {/* Search */}
            <button className="nav-icon-btn" style={{ color: textColor }} title="Search"
              onClick={() => navigate('/shop')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Profile */}
            {user ? (
              <button className="nav-icon-btn" style={{ color: textColor }}
                onClick={() => navigate('/profile')} title="Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            ) : (
              <button className="nav-icon-btn" style={{ color: textColor }}
                onClick={() => navigate('/login')} title="Login">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}

            {/* Cart */}
            <button className="nav-icon-btn" style={{ color: textColor, position: 'relative' }}
              onClick={() => setIsOpen(true)} title="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* Hamburger */}
            <div className={`nav-hamburger${menuOpen ? ' open' : ''}`}
              style={{ color: textColor }}
              onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {[
          { to: '/', label: 'Home' },
          { to: '/shop', label: 'Shop' },
          { to: '/shop?category=Hoodies', label: 'Hoodies' },
          { to: '/shop?category=Blazers', label: 'Blazers' },
          { to: '/shop?category=Coats', label: 'Coats' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} className="nav-link" onClick={() => setMenuOpen(false)}>{label}</Link>
        ))}
        {user ? (
          <>
            <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button className="nav-link" style={{ color: 'var(--cream)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.1em' }} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
        )}
      </div>

      <CartDrawer />
    </>
  );
}
