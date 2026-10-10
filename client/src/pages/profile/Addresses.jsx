import { useState } from 'react';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';

const NOTICE = 'Preview only — addresses are not saved to your account yet.';

const EMPTY = { label: 'Home', name: '', phone: '', address: '', city: '', state: '', postalCode: '' };

export default function Addresses() {
  // Kept in component state: nothing is persisted while this is a preview.
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const add = (e) => {
    e.preventDefault();
    setAddresses([...addresses, { ...form, id: Date.now() }]);
    setForm(EMPTY);
    setAdding(false);
    toast(NOTICE, {
      style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
    });
  };

  const remove = (id) => setAddresses(addresses.filter((a) => a.id !== id));

  return (
    <SettingsShell title="Saved Addresses" subtitle="Where your orders should be delivered." notice={NOTICE}>
      {addresses.length === 0 && !adding && (
        <p className="settings-empty">You haven&apos;t saved any addresses yet.</p>
      )}

      <div className="address-list">
        {addresses.map((a) => (
          <article className="address-card" key={a.id}>
            <div className="address-card-head">
              <span className="badge badge-black">{a.label}</span>
              <button type="button" className="address-remove" onClick={() => remove(a.id)}>Remove</button>
            </div>
            <p className="address-name">{a.name || 'Name'} · {a.phone || 'Phone'}</p>
            <p className="address-line">
              {[a.address, a.city, a.state, a.postalCode].filter(Boolean).join(', ')}
            </p>
          </article>
        ))}
      </div>

      {adding ? (
        <form className="settings-form" onSubmit={add}>
          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="ad-label">Label</label>
              <select id="ad-label" name="label" value={form.label} onChange={change}>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="ad-name">Full Name</label>
              <input id="ad-name" name="name" value={form.name} onChange={change} />
            </div>
            <div className="settings-field">
              <label htmlFor="ad-phone">Phone</label>
              <input id="ad-phone" name="phone" type="tel" value={form.phone} onChange={change} />
            </div>
            <div className="settings-field">
              <label htmlFor="ad-postal">Postal Code</label>
              <input id="ad-postal" name="postalCode" value={form.postalCode} onChange={change} />
            </div>
            <div className="settings-field settings-field-full">
              <label htmlFor="ad-address">Street Address</label>
              <input id="ad-address" name="address" value={form.address} onChange={change} />
            </div>
            <div className="settings-field">
              <label htmlFor="ad-city">City</label>
              <input id="ad-city" name="city" value={form.city} onChange={change} />
            </div>
            <div className="settings-field">
              <label htmlFor="ad-state">State</label>
              <input id="ad-state" name="state" value={form.state} onChange={change} />
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn btn-primary">Save Address</button>
            <button type="button" className="btn btn-outline" onClick={() => { setAdding(false); setForm(EMPTY); }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="settings-actions">
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            + Add New Address
          </button>
        </div>
      )}
    </SettingsShell>
  );
}
