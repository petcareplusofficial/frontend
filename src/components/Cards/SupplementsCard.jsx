import React from "react";
import "../Cards/Cards.css";

// Import your supplements SVG file
import supplementsIcon from "../../assets/reports-page/Supplements.svg";

const PawIcon = ({ color = "#1E6F78", size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <circle cx="9" cy="10" r="2" />
    <circle cx="15" cy="14" r="2" />
    <path d="M9 18h-.5A3.5 3.5 0 0 1 5 14.5v-1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1a3.5 3.5 0 0 1-3.5 3.5H13" />
  </svg>
);

const CapsuleIcon = ({ color = "#1E6F78", size = 28 }) => (
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
    <path d="m2 10 7.5-7.5a5 5 0 0 1 7 7L9 17" />
    <path d="M14 22 21.5 14.5a5 5 0 0 0-7-7L7 15" />
    <path d="M8 8h8" />
  </svg>
);

export default function SupplementsCard({ supplements }) {
  return (
    <div className="supplements-card">
      {/* REMOVED: Internal header section to fix duplicate heading issue. */}

      {/* Empty State */}
      {!supplements || supplements.length === 0 ? (
        <div className="diet-grid-empty">
          No supplement records found for this period.
        </div>
      ) : (
        <div className="supplements-grid">
          {supplements.map((supplement, idx) => (
            <div className="supplements-row" key={idx}>
              <div className="supplements-time">
                {supplement.value || supplement.time}
              </div>

              <div className="supplements-icon">
                {supplement.icon || <PawIcon size={22} color="#1E6F78" />}
              </div>

              <div className="supplements-value">
                {supplement.description || supplement.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
