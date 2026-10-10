import { useState } from 'react';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';
import { useAuth } from '../../context/AuthContext';

const toastStyle = {
  style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
};

export default function EditProfile() {
  const { user, saveProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dob: user?.dob || '',
  });
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await saveProfile(form);
      setForm({
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        gender: updated.gender || '',
        dob: updated.dob || '',
      });
      toast.success('Profile updated', toastStyle);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save your profile', toastStyle);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell title="Edit Profile" subtitle="Update your personal details.">
      <form className="settings-form" onSubmit={submit}>
        <div className="settings-grid">
          <div className="settings-field">
            <label htmlFor="ep-name">Full Name</label>
            <input id="ep-name" name="name" type="text" value={form.name} onChange={change} required />
          </div>
          <div className="settings-field">
            <label htmlFor="ep-email">Email</label>
            <input id="ep-email" name="email" type="email" value={form.email} onChange={change} required />
          </div>
          <div className="settings-field">
            <label htmlFor="ep-phone">Phone Number</label>
            <input id="ep-phone" name="phone" type="tel" value={form.phone} onChange={change} placeholder="+91 00000 00000" />
          </div>
          <div className="settings-field">
            <label htmlFor="ep-gender">Gender</label>
            <select id="ep-gender" name="gender" value={form.gender} onChange={change}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="settings-field">
            <label htmlFor="ep-dob">Date of Birth</label>
            <input id="ep-dob" name="dob" type="date" value={form.dob} onChange={change} />
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </SettingsShell>
  );
}
