import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getAuthHeader, formatPrice } from '../utils/helpers';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount, description }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = coupon?.discount || 0;
  const orderTotal = Math.max(cartTotal - discount, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) { setCouponError('Enter a coupon code'); return; }
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await axios.post('/api/coupons/validate', { code, subtotal: cartTotal });
      setCoupon(data);
      setCouponInput('');
      toast.success(`Coupon ${data.code} applied — ${formatPrice(data.discount)} off`, {
        style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
        iconTheme: { primary: 'var(--gold)', secondary: 'var(--black)' },
      });
    } catch (err) {
      setCoupon(null);
      setCouponError(err.response?.data?.message || 'Could not apply this coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to place an order'); navigate('/login'); return; }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map((i) => ({
          product: i._id, name: i.name, image: i.image, price: i.price, qty: i.qty, size: i.size, color: i.color,
        })),
        shippingAddress: { address: form.address, city: form.city, postalCode: form.postalCode, country: form.country },
        // The server recomputes the totals, so only the code is sent.
        couponCode: coupon?.code || null,
      };
      await axios.post('/api/orders', orderData, { headers: getAuthHeader() });
      clearCart();
      toast.success('Order placed successfully! 🎉', {
        style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
        duration: 4000,
      });
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      // A rejected coupon should not stay applied in the summary.
      if (err.response?.status === 400 && coupon) handleRemoveCoupon();
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '8rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1rem' }}>Your cart is empty</h2>
          <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex' }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="container">
        <div style={{ paddingTop: '1rem' }}>
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Complete your details to place the order.</p>
        </div>

        <div className="checkout-grid">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form-section">
            {/* Contact */}
            <div>
              <h2 className="checkout-section-title">Contact Information</h2>
              <div className="checkout-form-grid">
                <div className="form-group">
                  <label htmlFor="co-name">Full Name</label>
                  <input id="co-name" name="name" type="text" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="co-email">Email</label>
                  <input id="co-email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group full">
                  <label htmlFor="co-phone">Phone Number</label>
                  <input id="co-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="checkout-section-title">Shipping Address</h2>
              <div className="checkout-form-grid">
                <div className="form-group full">
                  <label htmlFor="co-address">Street Address</label>
                  <input id="co-address" name="address" type="text" value={form.address} onChange={handleChange} required placeholder="123 Street, Apartment 4B" />
                </div>
                <div className="form-group">
                  <label htmlFor="co-city">City</label>
                  <input id="co-city" name="city" type="text" value={form.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="co-state">State</label>
                  <input id="co-state" name="state" type="text" value={form.state} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="co-postal">Postal Code</label>
                  <input id="co-postal" name="postalCode" type="text" value={form.postalCode} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="co-country">Country</label>
                  <input id="co-country" name="country" type="text" value={form.country} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="checkout-section-title">Payment</h2>
              <div className="payment-option">
                <span className="payment-dot" aria-hidden="true" />
                <div>
                  <p className="payment-option-title">Cash on Delivery</p>
                  <p className="payment-option-sub">Pay when your order arrives at your doorstep.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '1.1rem', fontSize: '0.85rem', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order — ${formatPrice(orderTotal)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.key} className="summary-item">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                      {[item.size, item.color].filter(Boolean).join(' · ')} × {item.qty}
                    </p>
                  </div>
                </div>
                <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            {/* Coupon */}
            <div className="coupon-box">
              {coupon ? (
                <div className="coupon-applied">
                  <div>
                    <p className="coupon-code">🎟 {coupon.code}</p>
                    <p className="coupon-desc">{coupon.description || 'Coupon applied'}</p>
                  </div>
                  <button type="button" className="coupon-remove" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-form" onSubmit={handleApplyCoupon}>
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                  />
                  <button type="submit" disabled={couponLoading}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row summary-row-discount">
                <span>Discount ({coupon.code})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-free">Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
