import React from "react";
import "../Cards/Cards.css";
import pawIcon from "../../assets/reports-page/Paw-icon.svg";

export default function MedicalCard({ vitals }) {
  return (
    <div className="medical-card">
      <h3 className="medical-header"></h3>

      {!vitals || vitals.length === 0 ? (
        <div className="medical-card-empty">
          <p>No medical vitals data available for this month.</p>
        </div>
      ) : (
        <div className="medical-vitals-list">
          {vitals.map((vital, index) => (
            <div className="medical-vital-row" key={index}>
              <div className="medical-vital-left">
                <div className="medical-vital-icon">{vital.icon}</div>
                <div className="medical-vital-info">
                  <span className="medical-vital-label">{vital.label}</span>
                  <span className="medical-vital-unit">{vital.unit}</span>
                </div>
              </div>
              <div className="medical-vital-center">
                <img src={pawIcon}></img>
              </div>

              <div className="medical-vital-right">
                <span className="medical-vital-value">{vital.value}</span>
                <span
                  className={`medical-vital-status ${
                    vital.status?.toLowerCase() || "default"
                  }`}
                >
                  {vital.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
