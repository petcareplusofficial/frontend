import "./Cards.css";

// 440x248 - Large Card
export function VitalsCardLarge() {
  return (
    <div className="vitals-card large">
      <VitalsRow
        icon="🩺"
        label="Respiratory Rate"
        pet="🐾"
        value="80"
        unit="mg / dL"
        status="Normal"
      />
      <VitalsRow
        icon="❤️"
        label="Heart Rate"
        pet="🐾"
        value="98"
        unit="bpm"
        status="Normal"
      />
      <VitalsRow
        icon="💧"
        label="Blood Pressure"
        pet="🐾"
        value="102"
        unit="mmhg"
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
        icon="🩺"
        label="Respiratory Rate"
        pet="🐾"
        value="80"
        unit="mg / dL"
        status="Normal"
      />
      <VitalsRow
        icon="❤️"
        label="Heart Rate"
        pet="🐾"
        value="98"
        unit="bpm"
        status="Normal"
      />
      <VitalsRow
        icon="💧"
        label="Blood Pressure"
        pet="🐾"
        value="102"
        unit="mmhg"
        status="Normal"
      />
    </div>
  );
}

// reusable row
function VitalsRow({ icon, label, pet, value, unit, status }) {
  return (
    <div className="vitals-row">
      <span className="vitals-icon">{icon}</span>
      <span className="vitals-label">{label}</span>
      <span className="vitals-pet">{pet}</span>
      <span className="vitals-value">{value}</span>
      <span className="vitals-unit">{unit}</span>
      <span className="vitals-status">{status}</span>
    </div>
  );
}
