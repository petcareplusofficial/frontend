import "../Cards.css";
import heartRate from "../../assets/pet-health/heart-rate.svg";
import BloodPressureIcon from "../../assets/pet-health/blood-pressure.svg";
import RespiratoryIcon from "../../assets/pet-health/repiratory-icon.svg";

// 440x248 - Large Card
export function VitalsCardLarge() {
  return (
    <div className="vitals-card large">
      <VitalsRow
        SvgIcon={RespiratoryIcon}
        label="Respiratory Rate"
        value="80"
        unit="mg / dL"
        status="Normal"
      />

      <VitalsRow
        SvgIcon={heartRate}
        label="Heart Rate"
        value="80"
        unit="mg / dL"
        status="Normal"
      />

      <VitalsRow
        SvgIcon={BloodPressureIcon}
        label="Blood Pressure"
        value="80"
        unit="mg / dL"
        status="Normal"
      />
    </div>
  );
}

// 335x188 - Small Card
export function VitalsCardSmall() {
  return (
    <div className="vitals-card small">
      <VitalsRow
        SvgIcon={RespiratoryIcon}
        label="Respiratory Rate"
        value="80"
        unit="mg / dL"
        status="Normal"
      />

      <VitalsRow
        SvgIcon={heartRate}
        label="Heart Rate"
        value="80"
        unit="mg / dL"
        status="Normal"
      />

      <VitalsRow
        SvgIcon={BloodPressureIcon}
        label="Blood Pressure"
        value="80"
        unit="mg / dL"
        status="Normal"
      />
    </div>
  );
}

// Reusable row component
function VitalsRow({ SvgIcon, icon, label, value, unit, status }) {
  return (
    <div className="vitals-row">
      {SvgIcon ? (
        <img src={SvgIcon} alt={label} className="vitals-icon-svg" />
      ) : (
        <span className="vitals-icon">{icon}</span>
      )}

      <span className="vitals-label">{label}</span>
      <span className="vitals-value">{value}</span>
      <span className="vitals-unit">{unit}</span>
      <span className="vitals-status">{status}</span>
    </div>
  );
}
