import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

/**
 * Shared shell for every /profile/* settings page: navbar, back link to the
 * profile hub, page heading, optional preview notice and a content card.
 */
export default function SettingsShell({ title, subtitle, notice, children }) {
  return (
    <div className="settings-page">
      <Navbar />
      <div className="container settings-container">
        <Link to="/profile" className="settings-back">
          <span aria-hidden="true">←</span> Back to profile
        </Link>

        <h1 className="settings-title">{title}</h1>
        {subtitle && <p className="settings-sub">{subtitle}</p>}
        {notice && <p className="settings-notice">{notice}</p>}

        <div className="settings-card">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
