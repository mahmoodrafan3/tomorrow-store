import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getAuthHeader } from '../utils/helpers';

const PIN_RE = /^\d{6}$/;

const readSavedPincode = () => {
  try { return localStorage.getItem('tomorrow_pincode') || ''; } catch { return ''; }
};

// Delivery estimate for a pincode. There is no shipping backend yet, so the
// ETA is derived deterministically from the pincode (3–6 days).
const computeDelivery = (pin) => {
  const days = 3 + (Number(pin[5]) % 4);
  const eta = new Date();
  eta.setDate(eta.getDate() + days);
  return {
    pin,
    days,
    eta: eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
  };
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pincode, setPincode] = useState(readSavedPincode);
  const [delivery, setDelivery] = useState(() => {
    const saved = readSavedPincode();
    return PIN_RE.test(saved) ? computeDelivery(saved) : null;
  });
  const [similar, setSimilar] = useState([]);
  const similarRowRef = useRef(null);

  const colorMap = { Black: '#0D0D0D', Cream: '#F5F0E8', White: '#FFFFFF', Navy: '#1e3a5f' };

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`/api/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // "Similar Products": same category first, then topped up with the other
  // products so the section still shows when a category has only one item.
  useEffect(() => {
    if (!product?.category) return;
    axios.get('/api/products')
      .then(({ data }) => {
        const others = data.filter((p) => p._id !== id);
        const sameCategory = others.filter((p) => p.category === product.category);
        const rest = others.filter((p) => p.category !== product.category);
        setSimilar([...sameCategory, ...rest].slice(0, 8)); // one scrolling row
      })
      .catch(() => setSimilar([]));
  }, [product?.category, id]);

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, qty, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart!`, {
      style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
      iconTheme: { primary: 'var(--gold)', secondary: 'var(--black)' },
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to write a review');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/api/products/${id}/reviews`, { rating, comment }, { headers: getAuthHeader() });
      toast.success('Thanks! Your review is live.', {
        style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
        iconTheme: { primary: 'var(--gold)', secondary: 'var(--black)' },
      });
      setComment('');
      setRating(5);
      // Re-read the product so the new review and updated average show up.
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Nudge the Similar Products row left/right (the row also scrolls natively).
  const scrollSimilar = (direction) => {
    const row = similarRowRef.current;
    if (!row) return;
    // Smoothness comes from `scroll-behavior: smooth` on .similar-row.
    row.scrollBy({ left: direction * Math.max(row.clientWidth * 0.8, 300) });
  };

  const handleDeliveryCheck = (e) => {
    e.preventDefault();
    const pin = pincode.trim();
    if (!PIN_RE.test(pin)) {
      setDelivery({ error: 'Please enter a valid 6-digit pincode' });
      return;
    }
    try { localStorage.setItem('tomorrow_pincode', pin); } catch { /* ignore */ }
    setDelivery(computeDelivery(pin));
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="container product-loading-content">
        <button type="button" className="shop-back-btn" onClick={() => navigate(window.history.state?.idx > 0 ? -1 : '/shop')}>
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="detail-grid">
          <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[80, 200, 60, 120, 200].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: '20px', width: `${w}px`, borderRadius: '4px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '8rem 0' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Back to Shop</Link>
      </div>
    </div>
  );

  return (
    <div className="product-detail">
      <Navbar />
      <div className="container">
        <div className="detail-grid">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="detail-main-img">
              <button type="button" className="detail-back-btn" aria-label="Go back" title="Back" onClick={() => navigate(window.history.state?.idx > 0 ? -1 : '/shop')}>
                <span aria-hidden="true">←</span>
              </button>
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="detail-brand">Tomorrow</p>
            <h1 className="detail-title">{product.name}</h1>

            {/* Rating */}
            <div className="detail-rating">
              <span className="stars">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <div className="detail-price">{formatPrice(product.price)}</div>

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Color: <strong>{selectedColor}</strong>
                </p>
                <div className="color-dots">
                  {product.colors.map((c) => (
                    <div
                      key={c}
                      className={`color-dot${selectedColor === c ? ' active' : ''}`}
                      style={{
                        background: colorMap[c] || c,
                        border: c === 'Cream' || c === 'White' ? '1px solid rgba(0,0,0,0.15)' : 'none',
                        boxShadow: selectedColor === c ? '0 0 0 2px var(--gold)' : 'none',
                      }}
                      title={c}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Size: <strong>{selectedSize}</strong>
                </p>
                <div className="size-grid">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`size-btn${selectedSize === s ? ' active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Quantity</p>
              <div className="qty-control" style={{ border: '1px solid rgba(0,0,0,0.2)', padding: '0.5rem 1rem' }}>
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="qty-num">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            {/* Actions */}
            <div className="detail-actions" style={{ flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ flex: '1', justifyContent: 'center', padding: '1rem', minWidth: '200px' }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="btn btn-outline" style={{ padding: '1rem 1.5rem' }} title="Add to Wishlist">♡</button>
            </div>

            {/* Description */}
            <div className="detail-description">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>About this piece</h3>
              <p>{product.description}</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['Category', product.category],
                  ['Available Sizes', product.sizes?.join(', ')],
                  ['Available Colors', product.colors?.join(', ')],
                ].map(([label, val]) => val ? (
                  <div key={label} style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--gray)', minWidth: '140px', fontWeight: 500 }}>{label}</span>
                    <span>{val}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
        </div>

        {/* Check for Delivery Details */}
        <section className="delivery-check">
          <h3 className="delivery-title">Check for Delivery Details</h3>
          <form className="delivery-form" onSubmit={handleDeliveryCheck}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit pincode"
              aria-label="Pincode"
            />
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
              Check
            </button>
          </form>

          {delivery && (delivery.error ? (
            <p className="delivery-msg error">{delivery.error}</p>
          ) : (
            <div className="delivery-msg ok">
              <p>✓ Delivers to <strong>{delivery.pin}</strong> by <strong>{delivery.eta}</strong></p>
              <p className="delivery-sub">Free shipping · Easy returns</p>
            </div>
          ))}
        </section>

        {/* Reviews — the same review system for every product */}
        <section className="reviews-section">
          <div className="reviews-head">
            <h2 className="reviews-title">Reviews</h2>
            <div className="reviews-summary">
              <span className="stars">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
              <span>
                {product.numReviews > 0
                  ? `${(product.rating || 0).toFixed(1)} out of 5 · ${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'}`
                  : 'No reviews yet'}
              </span>
            </div>
          </div>

          <div className="reviews-grid">
            {/* Existing reviews */}
            <div className="reviews-list">
              {product.reviews?.length ? (
                [...product.reviews].reverse().map((r) => (
                  <article className="review-card" key={r._id}>
                    <div className="review-head">
                      <span className="review-avatar">{(r.name || '?')[0].toUpperCase()}</span>
                      <div>
                        <p className="review-name">{r.name}</p>
                        <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <time className="review-date">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </time>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </article>
                ))
              ) : (
                <p className="reviews-empty">Be the first to review this piece.</p>
              )}
            </div>

            {/* Write a review */}
            <div className="review-form-card">
              <h3>Write a review</h3>
              {user ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <div className="star-picker" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`star-pick${n <= rating ? ' active' : ''}`}
                        onClick={() => setRating(n)}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on fit, fabric and finish…"
                    rows={4}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p className="review-login">
                  <Link to="/login" className="auth-link">Sign in</Link> to write a review.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Similar Products — a single row that scrolls left/right */}
      {similar.length > 0 && (
        <section className="section similar-section">
          <div className="container">
            <div className="similar-head">
              <div>
                <p className="section-eyebrow">You may also like</p>
                <h2 className="section-title">Similar Products</h2>
              </div>
              <div className="similar-arrows">
                <button
                  type="button"
                  className="similar-arrow"
                  onClick={() => scrollSimilar(-1)}
                  aria-label="Scroll left"
                  title="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="similar-arrow"
                  onClick={() => scrollSimilar(1)}
                  aria-label="Scroll right"
                  title="Next"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="similar-row" ref={similarRowRef}>
              {similar.map((p) => (
                <div className="similar-item" key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
