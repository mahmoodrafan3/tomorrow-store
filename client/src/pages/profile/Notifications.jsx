import { useState } from 'react';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';
import Toggle from './Toggle';
import { useAuth } from '../../context/AuthContext';

const toastStyle = {
  style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
};

// Fallbacks mirror the schema defaults so an account created before these
// preferences existed still renders the intended starting state.
const DEFAULTS = {
  orderUpdates: true,
  shippingAlerts: true,
  offers: false,
  newsletter: true,
  sms: false,
};

export default function Notifications() {
  const { user, savePreferences } = useAuth();
  const prefs = { ...DEFAULTS, ...(user?.preferences?.notifications || {}) };
  const [saving, setSaving] = useState(false);

  const set = (key) => async (value) => {
    setSaving(true);
    try {
      await savePreferences({ notifications: { [key]: value } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save that preference', toastStyle);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell
      title="Notification Settings"
      subtitle="Choose what you want to hear about. Changes save automatically."
    >
      <div className="toggle-list">
        <Toggle
          id="n-order"
          label="Order updates"
          description="Order placed, packed and shipped alerts."
          checked={prefs.orderUpdates}
          onChange={set('orderUpdates')}
        />
        <Toggle
          id="n-shipping"
          label="Delivery alerts"
          description="Out for delivery and delivered confirmations."
          checked={prefs.shippingAlerts}
          onChange={set('shippingAlerts')}
        />
        <Toggle
          id="n-offers"
          label="Offers & drops"
          description="Early access to sales and new collections."
          checked={prefs.offers}
          onChange={set('offers')}
        />
        <Toggle
          id="n-newsletter"
          label="Newsletter"
          description="Monthly lookbook and editorial emails."
          checked={prefs.newsletter}
          onChange={set('newsletter')}
        />
        <Toggle
          id="n-sms"
          label="SMS notifications"
          description="Text messages for delivery-day updates."
          checked={prefs.sms}
          onChange={set('sms')}
        />
      </div>

      {saving && <p className="settings-sub">Saving...</p>}
    </SettingsShell>
  );
}
