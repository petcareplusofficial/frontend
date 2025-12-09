import React, { useRef, useState } from "react";
import "./MonthDropdown.css";

export default function MonthDropdown({
  months,
  value,
  onChange,
  monthsWithReports = [],
  style = {},
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  React.useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const highlightColor = "#17424b";
  const normalColor = "#fff";
  const textColor = "#247379";
  const selectedBg = "#247379";
  const selectedText = "#fff";

  return (
    <div
      ref={dropdownRef}
      className="month-dropdown-root"
      style={{ width: "170px", ...style }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="month-dropdown-btn"
      >
        {value}
        <span className="month-dropdown-arrow">▼</span>
      </button>
      {open && (
        <ul className="month-dropdown-list">
          {months.map((month) => {
            const isActive = monthsWithReports.includes(month);
            const isSelected = value === month;
            return (
              <li
                key={month}
                className={`month-dropdown-item${
                  isSelected ? " selected" : isActive ? " active" : ""
                }`}
                onClick={() => {
                  onChange({ target: { value: month } });
                  setOpen(false);
                }}
              >
                {month}
                {isSelected && <span className="month-dropdown-check">✔️</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
