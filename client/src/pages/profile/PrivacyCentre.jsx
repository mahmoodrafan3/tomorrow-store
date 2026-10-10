import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';
import Toggle from './Toggle';

const NOTICE = 'Preview only — privacy preferences are not saved yet.';
const toastStyle = {
  style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
};

export default function PrivacyCentre() {
  const [prefs, setPrefs] = useState({
    personalised: true,
    partnerSharing: false,
    activityLog: true,
  });

  const set = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <SettingsShell
      title="Privacy Centre"
      subtitle="Control how your data is used, and review what we store."
      notice={NOTICE}
    >
      <div className="toggle-list">
        <Toggle
          id="p-personalised"
          label="Personalised recommendations"
          description="Use my browsing and order history to suggest products."
          checked={prefs.personalised}
          onChange={set('personalised')}
        />
        <Toggle
          id="p-partners"
          label="Share data with partners"
          description="Allow trusted partners to measure campaign performance."
          checked={prefs.partnerSharing}
          onChange={set('partnerSharing')}
        />
        <Toggle
          id="p-activity"
          label="Keep my activity log"
          description="Store recent searches to make finding items faster."
          checked={prefs.activityLog}
          onChange={set('activityLog')}
        />
      </div>

      <div className="settings-divider" />

      <div className="settings-links">
        <Link to="/profile/terms" className="settings-inline-link">Terms, Policy &amp; License</Link>
        <Link to="/profile/faqs" className="settings-inline-link">Browse FAQs</Link>
      </div>

      <div className="settings-divider" />

      <div className="settings-actions">
        <button type="button" className="btn btn-outline" onClick={() => toast('Request logged (preview only).', toastStyle)}>
          Download my data
        </button>
        <button type="button" className="btn btn-outline settings-danger" onClick={() => toast('Account deletion is disabled in preview.', toastStyle)}>
          Delete my account
        </button>
      </div>
    </SettingsShell>
  );
}
