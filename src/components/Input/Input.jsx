import "./Input.css";

function Input({ label, type = "large", placeholder, helper }) {
  // type: "large", "medium", "small"
  return (
    <div className={`input-wrapper ${type}`}>
      <label className="input-label">{label}</label>
      <input className="input-field" placeholder={placeholder} />
      {helper && <div className="input-helper">{helper}</div>}
    </div>
  );
}

export default Input;
