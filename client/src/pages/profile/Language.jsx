import { useState } from 'react';
import toast from 'react-hot-toast';
import SettingsShell from './SettingsShell';
import { useAuth } from '../../context/AuthContext';

const toastStyle = {
  style: { fontFamily: 'var(--font-sans)', background: 'var(--black)', color: 'var(--cream)', borderRadius: '4px' },
};

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export default function Language() {
  const { user, savePreferences } = useAuth();
  const selected = user?.preferences?.language || 'en';
  const [saving, setSaving] = useState(false);

  const choose = async (code) => {
    if (code === selected) return;
    setSaving(true);
    try {
      await savePreferences({ language: code });
      toast.success('Language saved', toastStyle);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save your language', toastStyle);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell
      title="Select Language"
      subtitle="Choose the language you shop in. Changes save automatically."
    >
      <div className="settings-radio-list">
        {LANGUAGES.map((l) => (
          <label key={l.code} className={`settings-radio${selected === l.code ? ' active' : ''}`}>
            <input
              type="radio"
              name="language"
              value={l.code}
              checked={selected === l.code}
              onChange={() => choose(l.code)}
            />
            <span className="settings-radio-label">{l.label}</span>
            <span className="settings-radio-native">{l.native}</span>
          </label>
        ))}
      </div>

      {saving && <p className="settings-sub">Saving...</p>}
    </SettingsShell>
  );
}
