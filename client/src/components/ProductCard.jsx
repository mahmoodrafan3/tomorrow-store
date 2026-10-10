import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const cardRef = useRef(null);

  // 3D tilt effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -10;
      const rotateY = (x - centerX) / centerX * 10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)';
    };

    const handleMouseEnter = () => {
      card.style.transition = 'transform 150ms ease';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0] || '');
  };

  return (
    <div
      ref={cardRef}
      className="product-card"
      style={{ transition: 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <Link to={`/product/${product._id}`}>
        <div className="product-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

          {/* Overlay with CTA */}
          <div className="product-overlay">
            <div className="product-overlay-btn" onClick={handleAddToCart}>
              Add to Cart
            </div>
          </div>

          {/* Badges */}
          <div className="product-badge-wrap">
            {product.featured && <span className="badge badge-gold">Featured</span>}
            {product.stock < 10 && product.stock > 0 && (
              <span className="badge badge-black">Low Stock</span>
            )}
            {product.stock === 0 && (
              <span className="badge" style={{ background: '#888', color: '#fff' }}>Sold Out</span>
            )}
          </div>

          {/* Wishlist */}
          <button className="product-wishlist" onClick={(e) => e.preventDefault()} aria-label="Wishlist">
            ♡
          </button>
        </div>

        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="product-rating">
              <span style={{ fontSize: '0.75rem' }}>{'★'.repeat(Math.round(product.rating || 0))}</span>
              <span style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>({product.numReviews})</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
