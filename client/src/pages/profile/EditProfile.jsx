import { useState } from 'react';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';
import { useAuth } from '../../context/AuthContext';

const NOTICE = 'Preview only — profile changes are not saved yet.';

export default function EditProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    gender: '',
    dob: '',
  });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    toast(NOTICE, {
      style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
    });
  };

  return (
    <SettingsShell title="Edit Profile" subtitle="Update your personal details." notice={NOTICE}>
      <form className="settings-form" onSubmit={submit}>
        <div className="settings-grid">
          <div className="settings-field">
            <label htmlFor="ep-name">Full Name</label>
            <input id="ep-name" name="name" type="text" value={form.name} onChange={change} />
          </div>
          <div className="settings-field">
            <label htmlFor="ep-email">Email</label>
            <input id="ep-email" name="email" type="email" value={form.email} onChange={change} />
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
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </SettingsShell>
  );
}
