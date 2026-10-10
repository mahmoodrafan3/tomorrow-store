import { useState } from 'react';
import SettingsShell from './SettingsShell';

const NOTICE = 'Preview only — your language choice is not saved yet.';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export default function Language() {
  const [selected, setSelected] = useState('en');

  return (
    <SettingsShell title="Select Language" subtitle="Choose the language you shop in." notice={NOTICE}>
      <div className="settings-radio-list">
        {LANGUAGES.map((l) => (
          <label key={l.code} className={`settings-radio${selected === l.code ? ' active' : ''}`}>
            <input
              type="radio"
              name="language"
              value={l.code}
              checked={selected === l.code}
              onChange={() => setSelected(l.code)}
            />
            <span className="settings-radio-label">{l.label}</span>
            <span className="settings-radio-native">{l.native}</span>
          </label>
        ))}
      </div>
    </SettingsShell>
  );
}
