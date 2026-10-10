import { useState } from 'react';
import SettingsShell from './SettingsShell';
import Toggle from './Toggle';

const NOTICE = 'Preview only — notification preferences are not saved yet.';

export default function Notifications() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    shippingAlerts: true,
    offers: false,
    newsletter: true,
    sms: false,
  });

  const set = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <SettingsShell
      title="Notification Settings"
      subtitle="Choose what you want to hear about."
      notice={NOTICE}
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
    </SettingsShell>
  );
}
