import React from 'react';
import './Button.css';

// types: large, mid, small, mobile, add-health-report
export function Button({ label, type = 'large', leftIcon, rightIcon, onClick }) {
  return (
    <button className={`button ${type}`} onClick={onClick}>
      {leftIcon && <span className="icon">{leftIcon}</span>}
      <span className="label">{label}</span>
      {rightIcon && <span className="icon">{rightIcon}</span>}
    </button>
  );
}

export default Button;
