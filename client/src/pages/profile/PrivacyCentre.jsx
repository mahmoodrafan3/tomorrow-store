import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';
import Toggle from './Toggle';
import { useAuth } from '../../context/AuthContext';

const toastStyle = {
  style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
};

const DEFAULTS = { personalised: true, partnerSharing: false, activityLog: true };

export default function PrivacyCentre() {
  const { user, savePreferences } = useAuth();
  const prefs = { ...DEFAULTS, ...(user?.preferences?.privacy || {}) };
  const [saving, setSaving] = useState(false);

  const set = (key) => async (value) => {
    setSaving(true);
    try {
      await savePreferences({ privacy: { [key]: value } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save that preference', toastStyle);
    } finally {
      setSaving(false);
    }
  };

  // Export the account record the API holds for this customer.
  const downloadData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        gender: user?.gender,
        dob: user?.dob,
        addresses: user?.addresses || [],
        preferences: user?.preferences || {},
      },
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tomorrow-account-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Your data has been downloaded', toastStyle);
  };

  return (
    <SettingsShell
      title="Privacy Centre"
      subtitle="Control how your data is used, and review what we store. Changes save automatically."
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

      {saving && <p className="settings-sub">Saving...</p>}

      <div className="settings-divider" />

      <div className="settings-links">
        <Link to="/profile/terms" className="settings-inline-link">Terms, Policy &amp; License</Link>
        <Link to="/profile/faqs" className="settings-inline-link">Browse FAQs</Link>
      </div>

      <div className="settings-divider" />

      <div className="settings-actions">
        <button type="button" className="btn btn-outline" onClick={downloadData}>
          Download my data
        </button>
        <button
          type="button"
          className="btn btn-outline settings-danger"
          onClick={() => toast('Email support@tomorrow.com to close your account.', toastStyle)}
        >
          Delete my account
        </button>
      </div>
    </SettingsShell>
  );
}
