import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-logo">Tomorrow</div>
            <p className="footer-brand-desc">
              Premium clothing for those who live ahead. Crafted in silence, worn with intention. The future of fashion is now.
            </p>
            <div className="footer-social">
              {['Instagram', 'Twitter', 'Pinterest', 'YouTube'].map((s) => (
                <a key={s} href="#" className="footer-social-btn" title={s} aria-label={s}>
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-links">
              {['New Arrivals', 'Hoodies', 'Blazers', 'Trousers', 'Coats', 'Dresses'].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item}`} className="footer-link">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="footer-col-title">Info</h4>
            <ul className="footer-links">
              {['About Tomorrow', 'Sustainability', 'Careers', 'Press', 'Stockists'].map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links">
              {['Size Guide', 'Shipping Info', 'Returns', 'Contact Us', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Tomorrow. All rights reserved.</span>
          <span style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Policy</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
