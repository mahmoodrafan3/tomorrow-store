import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getAuthHeader, formatPrice, statusColor } from '../utils/helpers';

const ACCOUNT_SETTINGS = [
  { to: '/profile/settings',      label: 'Edit Profile',          icon: '👤' },
  { to: '/profile/addresses',     label: 'Saved Addresses',       icon: '📍' },
  { to: '/profile/language',      label: 'Select Language',       icon: '🌐' },
  { to: '/profile/notifications', label: 'Notification Settings', icon: '🔔' },
  { to: '/profile/privacy',       label: 'Privacy Centre',        icon: '🛡️' },
];

const INFO_LINKS = [
  { to: '/profile/terms', label: 'Terms, Policy & License', icon: '📄' },
  { to: '/profile/faqs',  label: 'Browse FAQs',             icon: '❓' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get('/api/orders/myorders', { headers: getAuthHeader() })
      .then(({ data }) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  return (
    <div className="profile-page">
      <Navbar />
      <div className="container section">
        <div className="profile-grid">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
            <p className="profile-name">{user.name}</p>
            <p className="profile-email">{user.email}</p>

            <nav className="settings-menu">
              <p className="settings-group-title">Account Settings</p>
              <ul className="settings-menu-list">
                {ACCOUNT_SETTINGS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="settings-link">
                      <span className="settings-link-icon" aria-hidden="true">{item.icon}</span>
                      <span className="settings-link-label">{item.label}</span>
                      <span className="settings-link-chevron" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="settings-group-title">Feedback &amp; Information</p>
              <ul className="settings-menu-list">
                {INFO_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="settings-link">
                      <span className="settings-link-icon" aria-hidden="true">{item.icon}</span>
                      <span className="settings-link-label">{item.label}</span>
                      <span className="settings-link-chevron" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <button type="button" className="settings-link settings-signout" onClick={handleLogout}>
                <span className="settings-link-icon" aria-hidden="true">↩</span>
                <span className="settings-link-label">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Orders */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '2rem' }}>
              Order History
            </h2>

            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px', marginBottom: '1rem' }} />
              ))
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray)', background: 'var(--cream-light)', borderRadius: '12px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.75rem' }}>No orders yet</h3>
                <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Start shopping and your orders will appear here.</p>
                <Link to="/shop" className="btn btn-primary">Shop Now</Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`order-status ${statusColor(order.status)}`}>{order.status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {order.orderItems.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name}
                        style={{ width: '56px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                    {order.orderItems.length > 4 && (
                      <div style={{ width: '56px', height: '70px', background: 'var(--cream-dark)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
