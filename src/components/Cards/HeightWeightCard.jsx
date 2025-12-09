import React from "react";
import "../Cards/Cards.css";
import pawIcon from "../../assets/reports-page/Paw-icon.svg";

const PawIcon = ({ color = "#1E6F78", size = 22 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="4" r="2" fill={color} />
    <circle cx="18" cy="8" r="2" fill={color} />
    <circle cx="20" cy="16" r="2" fill={color} />
    <circle cx="9" cy="10" r="2" fill={color} />
    <circle cx="15" cy="14" r="2" fill={color} />
    <path d="M9 18h-.5A3.5 3.5 0 0 1 5 14.5v-1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1a3.5 3.5 0 0 1-3.5 3.5H13" />
  </svg>
);

const RulerIcon = ({ color = "#FFFFFF", size = 28 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
);

const ScaleIcon = ({ color = "#FFFFFF", size = 28 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <rect x="3" y="11" width="12" height="10" rx="2" />
  </svg>
);

const ChartIcon = ({ color = "#FFFFFF", size = 28 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export default function HeightWeightCard({ rows }) {
  const defaultRows = [
    { icon: <RulerIcon />, label: "Height", value: "170 cm" },
    { icon: <ScaleIcon />, label: "Weight", value: "56 Kg" },
    { icon: <ChartIcon />, label: "BMI", value: "24.9" }, // Using ChartIcon as placeholder if icon wasn't passed
  ];

  const displayRows = rows || defaultRows;

  // Guarantee all 3 rows exist and are in H, B, W order from the prop data structure
  const safeRows = [
    displayRows[0] || { label: "Height", value: "N/A", icon: <RulerIcon /> }, // Index 0: Height
    displayRows[1] || { label: "BMI", value: "N/A", icon: <ChartIcon /> }, // Index 1: BMI
    displayRows[2] || { label: "Weight", value: "N/A", icon: <ScaleIcon /> }, // Index 2: Weight
  ];

  const getIcon = (row) => {
    if (!row) return null;

    // Prioritize the actual icon passed from Reports.jsx (the <img>)
    if (row.icon && typeof row.icon === "object") {
      return row.icon;
    }

    // Fallback logic (this is primarily for defaultRows/if the icon prop is missing)
    if (row.label === "Height") return <RulerIcon />;
    if (row.label === "Weight") return <ScaleIcon />;
    if (row.label === "BMI") return <ChartIcon />;

    return null;
  };

  return (
    <div className="hw-measurements-card">
      <div className="measurements-grid">
        {/* 1. HEIGHT ROW */}
        <div className="measurements-row">
          <div className="measurements-icon-box">{getIcon(safeRows[0])}</div>
          <div className="measurements-label">{safeRows[0].label}</div>
          <div className="measurements-paw-icon">
            <img src={pawIcon}></img>
          </div>
          <div className="measurements-value">{safeRows[0].value}</div>
        </div>

        {/* 2. BMI ROW (New/Corrected structure) */}
        <div className="measurements-row">
          <div className="measurements-icon-box">{getIcon(safeRows[1])}</div>
          <div className="measurements-label">{safeRows[1].label}</div>
          <div className="measurements-paw-icon">
            {/* BMI value is displayed without the paw icon in the screenshot, so removing the PawIcon */}
            {/* <PawIcon size={22} color="#1E6F78" /> */}
            <img src={pawIcon}></img>
          </div>
          <div className="measurements-value">{safeRows[1].value}</div>
        </div>

        {/* 3. WEIGHT ROW */}
        <div className="measurements-row">
          <div className="measurements-icon-box">{getIcon(safeRows[2])}</div>
          <div className="measurements-label">{safeRows[2].label}</div>
          <div className="measurements-paw-icon">
            <img src={pawIcon}></img>
          </div>
          <div className="measurements-value">{safeRows[2].value}</div>
        </div>
      </div>
    </div>
  );
}
