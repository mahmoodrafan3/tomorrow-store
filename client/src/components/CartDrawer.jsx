import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';

export default function CartDrawer() {
  const { cartItems, cartTotal, cartCount, isOpen, setIsOpen, removeFromCart, updateQty } = useCart();

  // Lock page scroll while the drawer is open so the background never moves
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`cart-drawer${isOpen ? ' open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">
            Your Cart
            {cartCount > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'var(--gray)', fontFamily: 'var(--font-sans)' }}>
                ({cartCount})
              </span>
            )}
          </h2>
          <button className="cart-close" onClick={() => setIsOpen(false)} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Items */}
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛍️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Your cart is empty</h3>
            <p style={{ fontSize: '0.9rem' }}>Discover our latest collection and add your favorites.</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setIsOpen(false)}>
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.key} className="cart-item">
                  <Link to={`/product/${item._id}`} onClick={() => setIsOpen(false)}>
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  </Link>

                  <div>
                    <Link to={`/product/${item._id}`} onClick={() => setIsOpen(false)}>
                      <h4 className="cart-item-name">{item.name}</h4>
                    </Link>
                    <p className="cart-item-meta">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </p>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(item.key, item.qty - 1)}>−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.key, item.qty + 1)}>+</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="cart-item-price">{formatPrice(item.price * item.qty)}</span>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.key)} aria-label="Remove">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer — minimal */}
            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Subtotal</span>
                <span className="cart-total-amount">{formatPrice(cartTotal)}</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '0.9rem', textAlign: 'center' }}>
                Shipping & taxes calculated at checkout
              </p>
              <div className="cart-actions">
                <Link
                  to="/checkout"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.9rem' }}
                  onClick={() => setIsOpen(false)}
                >
                  Proceed to Checkout
                </Link>
                <button className="cart-continue-link" onClick={() => setIsOpen(false)}>
                  Continue
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
