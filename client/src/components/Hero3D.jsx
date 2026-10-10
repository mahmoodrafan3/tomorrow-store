import { useRef, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Hero3D() {
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);
  const heroImgRef = useRef(null);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [activeHeroImage, setActiveHeroImage] = useState(0);

  const heroImages = [
    { src: '/images/hero-street.jpg', alt: 'Model wearing the new collection' },
    { src: '/images/Streetwear%20Attitude%20in%20Studio%20Light.png', alt: 'Streetwear look in studio light' },
    { src: '/images/Moody%20Streetwear%20Chair%20Portrait.png', alt: 'Streetwear portrait seated on a chair' },
  ];

  // The hero image is preloaded in index.html, so it is usually already decoded
  // before React attaches onLoad — in that case onLoad never fires and the photo
  // would stay at opacity 0 forever. Fall back to the element's `complete` flag.
  useEffect(() => {
    const img = heroImgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setHeroImgLoaded(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroImage((index) => (index + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  // Mouse parallax
  const handleMouseMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    // CSS parallax layers
    if (layer1Ref.current) {
      layer1Ref.current.style.transform = `translate(${x * -15}px, ${y * -10}px)`;
    }
    if (layer2Ref.current) {
      layer2Ref.current.style.transform = `translate(${x * -30}px, ${y * -20}px)`;
    }
    if (layer3Ref.current) {
      layer3Ref.current.style.transform = `translate(${x * 20}px, ${y * 15}px)`;
    }
  }, []);

  // Marquee items
  const marqueeItems = [
    'New Collection', 'Minimal Luxury', 'Dress Tomorrow', 'Free Shipping',
    'Premium Fabrics', 'Limited Edition', 'New Collection', 'Minimal Luxury',
    'Dress Tomorrow', 'Free Shipping', 'Premium Fabrics', 'Limited Edition',
  ];

  return (
    <>
      <section className="hero" onMouseMove={handleMouseMove}>
        {/* Gradient overlays */}
        <div className="hero-bg-gradient" />
        <div className="hero-grain" />

        {/* Editorial photo — smooth fade-in once loaded */}
        <div className="hero-photo-wrap" style={{
          opacity: heroImgLoaded ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {heroImages.map((image, index) => (
            <img
              ref={index === 0 ? heroImgRef : undefined}
              key={image.src}
              className={`hero-photo${index === activeHeroImage ? ' active' : ''}`}
              src={image.src}
              alt={image.alt}
              draggable={false}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              onLoad={() => setHeroImgLoaded(true)}
            />
          ))}
        </div>

        {/* Ghost brand text behind the photo for depth */}
        <div className="hero-photo-ghost">TOMORROW</div>

        {/* Parallax decorative text layers */}
        <div ref={layer1Ref} className="parallax-layer" style={{
          position: 'absolute', top: '15%', left: '5%',
          fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 12vw, 10rem)',
          fontWeight: 900, color: 'transparent',
          WebkitTextStroke: '1px rgba(13,13,13,0.05)',
          userSelect: 'none', letterSpacing: '-0.02em', lineHeight: 1,
          transition: 'transform 0.3s ease',
        }}>
          TOMORROW
        </div>
        <div ref={layer2Ref} className="parallax-layer" style={{
          position: 'absolute', bottom: '10%', right: '3%',
          fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 900, color: 'transparent',
          WebkitTextStroke: '1px rgba(201,169,110,0.35)',
          userSelect: 'none', letterSpacing: '0.1em', lineHeight: 1,
          transition: 'transform 0.3s ease',
        }}>
          2025
        </div>
        <div ref={layer3Ref} className="parallax-layer" style={{
          position: 'absolute', top: '45%', right: '8%',
          width: '200px', height: '200px',
          border: '1px solid rgba(201,169,110,0.4)',
          borderRadius: '50%',
          transition: 'transform 0.3s ease',
          animation: 'rotateSlowly 30s linear infinite',
        }} />

        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            <span>Dress</span>
            <span className="italic">Tomorrow</span>
            <span>Today</span>
          </h1>
          <p className="hero-subtitle">
            Premium clothing for those who live ahead. Crafted in silence. Worn with intention.
          </p>
          <div className="hero-cta">
            <Link to="/shop" className="btn btn-cream" style={{ fontSize: '0.8rem', padding: '1rem 2.5rem' }}>
              Shop Collection
            </Link>
            <Link to="/shop?featured=true" className="btn" style={{
              background: 'transparent', color: 'var(--black)',
              border: '1px solid rgba(13,13,13,0.35)', fontSize: '0.8rem', padding: '1rem 2.5rem',
            }}>
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <div key={i} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
