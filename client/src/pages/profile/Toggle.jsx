export default function Toggle({ id, label, description, checked, onChange }) {
  return (
    <label className="toggle-row" htmlFor={id}>
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-desc">{description}</span>}
      </span>
      <span className="switch">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="switch-track" aria-hidden="true" />
      </span>
    </label>
  );
}
