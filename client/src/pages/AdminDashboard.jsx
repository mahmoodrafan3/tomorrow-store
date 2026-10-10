import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getAdminAuthHeader, formatPrice, statusColor } from '../utils/helpers';

const ADMIN_TABS = ['Overview', 'Products', 'Orders'];

export default function AdminDashboard() {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', image: '', sizes: '', colors: '', stock: '', featured: false });

  useEffect(() => {
    if (!admin) { navigate('/admin/login', { replace: true }); return; }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login', { replace: true });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/orders', { headers: getAdminAuthHeader() }),
      ]);
      setProducts(pRes.data);
      setOrders(oRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setForm({
        name: product.name, description: product.description, price: product.price,
        category: product.category, image: product.image,
        sizes: product.sizes?.join(', '), colors: product.colors?.join(', '),
        stock: product.stock, featured: product.featured,
      });
    } else {
      setEditProduct(null);
      setForm({ name: '', description: '', price: '', category: '', image: '', sizes: '', colors: '', stock: '', featured: false });
    }
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        sizes: JSON.stringify(form.sizes.split(',').map((s) => s.trim()).filter(Boolean)),
        colors: JSON.stringify(form.colors.split(',').map((s) => s.trim()).filter(Boolean)),
        featured: form.featured.toString(),
      };
      if (editProduct) {
        await axios.put(`/api/products/${editProduct._id}`, payload, { headers: getAdminAuthHeader() });
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', payload, { headers: getAdminAuthHeader() });
        toast.success('Product created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: getAdminAuthHeader() });
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status }, { headers: getAdminAuthHeader() });
      toast.success('Order updated!');
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
  };

  const totalRevenue = orders.reduce((a, o) => a + o.totalPrice, 0);

  if (!admin) return null;

  return (
    <div className={`admin-shell${sidebarOpen ? ' admin-menu-open' : ''}`}>
      <button
        type="button"
        className="admin-menu-toggle"
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <span className="admin-menu-toggle-icon" aria-hidden="true">☰</span>
        <span>{tab}</span>
      </button>
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar" id="admin-sidebar">
          <p className="admin-sidebar-logo">Tomorrow Admin</p>
          {ADMIN_TABS.map((t) => (
            <button
              key={t}
              className={`admin-nav-item${tab === t ? ' active' : ''}`}
              onClick={() => { setTab(t); setSidebarOpen(false); }}
            >
              <span className="admin-nav-icon">
                {t === 'Overview' ? '📊' : t === 'Products' ? '👕' : '📦'}
              </span>
              {t}
            </button>
          ))}
          <div style={{ marginTop: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(245,240,232,0.55)', fontSize: '0.78rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              {admin.name}
            </div>
            <button
              onClick={handleLogout}
              style={{ textAlign: 'left', color: 'rgba(245,240,232,0.4)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}
            >
              ⎋ Sign out
            </button>
            <Link to="/" style={{ color: 'rgba(245,240,232,0.4)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ← Back to Store
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* ── Overview ── */}
          {tab === 'Overview' && (
            <div>
              <h1 className="admin-page-title">Dashboard</h1>
              <div className="stats-grid">
                {[
                  { icon: '💰', label: 'Total Revenue', value: formatPrice(totalRevenue) },
                  { icon: '📦', label: 'Total Orders', value: orders.length },
                  { icon: '👕', label: 'Products', value: products.length },
                  { icon: '⏳', label: 'Pending Orders', value: orders.filter((o) => o.status === 'pending').length },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="stat-card">
                    <div className="stat-icon">{icon}</div>
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>Recent Orders</h2>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o._id}>
                        <td>#{o._id.slice(-8).toUpperCase()}</td>
                        <td>{o.user?.name || 'N/A'}</td>
                        <td>{formatPrice(o.totalPrice)}</td>
                        <td><span className={`order-status ${statusColor(o.status)}`}>{o.status}</span></td>
                        <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {tab === 'Products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Products</h1>
                <button className="btn btn-primary" onClick={() => openModal()} style={{ fontSize: '0.75rem' }}>
                  + Add Product
                </button>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td><img src={p.image} alt={p.name} className="table-img" /></td>
                        <td style={{ fontWeight: 600, maxWidth: '200px' }}>{p.name}</td>
                        <td>{p.category}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td>
                          <span style={{ color: p.stock < 5 ? '#cc3333' : 'inherit', fontWeight: p.stock < 5 ? 700 : 400 }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn action-btn-edit" onClick={() => openModal(p)}>Edit</button>
                            <button className="action-btn action-btn-delete" onClick={() => handleDelete(p._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === 'Orders' && (
            <div>
              <h1 className="admin-page-title">Orders</h1>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>#{o._id.slice(-8).toUpperCase()}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.user?.name || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{o.user?.email}</div>
                        </td>
                        <td>{o.orderItems?.length}</td>
                        <td style={{ fontWeight: 700 }}>{formatPrice(o.totalPrice)}</td>
                        <td><span className={`order-status ${statusColor(o.status)}`}>{o.status}</span></td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.78rem', cursor: 'pointer', background: 'var(--cream)' }}
                          >
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
        <div className="modal">
          <h2 className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
          <form className="modal-form" onSubmit={handleSave}>
            {[
              { label: 'Product Name', name: 'name', type: 'text', required: true },
              { label: 'Category', name: 'category', type: 'text', required: true },
              { label: 'Price (₹)', name: 'price', type: 'number', required: true },
              { label: 'Stock', name: 'stock', type: 'number', required: true },
              { label: 'Image URL', name: 'image', type: 'text', required: true },
              { label: 'Sizes (comma separated)', name: 'sizes', type: 'text' },
              { label: 'Colors (comma separated)', name: 'colors', type: 'text' },
            ].map(({ label, name, type, required }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input name={name} type={type} value={form[name]} onChange={handleFormChange} required={required} />
              </div>
            ))}
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} required style={{ resize: 'vertical', padding: '0.75rem', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '4px', background: 'var(--cream-light)', fontFamily: 'var(--font-sans)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input id="modal-featured" type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} />
              <label htmlFor="modal-featured" style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>Mark as Featured</label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editProduct ? 'Save Changes' : 'Create Product'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
