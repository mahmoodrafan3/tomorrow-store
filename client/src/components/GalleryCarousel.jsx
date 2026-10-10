import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function GalleryCarousel({ products = [] }) {
  const items = Array.isArray(products) ? products.filter(Boolean) : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(items.length - 1, 0)));
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2 || isPaused) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [items.length, isPaused]);

  if (items.length === 0) return null;

  const show = (index) => setActiveIndex((index + items.length) % items.length);

  return (
    <div
      className="gallery-carousel reveal"
      aria-label="Featured product gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="gallery-slider" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {items.map((product) => (
          <article className="gallery-slide" key={product._id || product.id || product.name}>
            <Link to={`/product/${product._id || product.id}`} className="gallery-slide-link" aria-label={`View ${product.name}`}>
              <img src={product.image} alt={product.name || 'Featured product'} />
              <div className="gallery-slide-overlay" />
              <div className="gallery-slide-copy">
                <span className="gallery-slide-category">{product.category || 'Tomorrow Collection'}</span>
                <h3>{product.name}</h3>
                {product.price != null && <span className="gallery-slide-price">₹{Number(product.price).toLocaleString('en-IN')}</span>}
              </div>
            </Link>
          </article>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button type="button" className="gallery-nav-btn gallery-nav-prev" onClick={() => show(activeIndex - 1)} aria-label="Previous product">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="gallery-nav-btn gallery-nav-next" onClick={() => show(activeIndex + 1)} aria-label="Next product">
            <span aria-hidden="true">›</span>
          </button>
          <div className="gallery-controls">
            <div className="gallery-dots" aria-label="Choose a product">
              {items.map((product, index) => (
                <button
                  type="button"
                  key={product._id || product.id || index}
                  className={`gallery-dot${index === activeIndex ? ' active' : ''}`}
                  onClick={() => show(index)}
                  aria-label={`Show product ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
            <span className="gallery-counter">{String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
          </div>
        </>
      )}
    </div>
  );
}
