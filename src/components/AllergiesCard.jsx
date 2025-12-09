import "./Cards.css";

export default function AllergiesCard({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      // Added 'allergies-grid-card' for unique styling scope
      <div className="allergies-grid-card">
        <div className="diet-grid-row">
          <div
            className="diet-grid-col"
            style={{ textAlign: "center", width: "100%" }}
          >
            No allergies found.
          </div>
        </div>
      </div>
    );
  }

  return (
    // Added 'allergies-grid-card' class
    <div className="allergies-grid-card">
      {/* Header */}
      <div
        className="diet-grid-row"
        style={{ fontWeight: "bold", fontSize: "1.13rem" }}
      >
        <div className="diet-grid-col diet-label"></div>
        <div className="diet-grid-col diet-label">Allergy Type</div>
        <div className="diet-grid-col diet-label">Symptoms</div>
        <div className="diet-grid-col diet-label">Severity</div>
      </div>
      {/* Data rows */}
      {rows.map((row, idx) => (
        <div className="diet-grid-row" key={idx}>
          <div className="diet-grid-col diet-label-icon">{row.icon}</div>
          <div className="diet-grid-col diet-label">
            {row.type || row.label}
          </div>
          <div className="diet-grid-col diet-label">
            {row.symptoms || row.value}
          </div>
          <div className="diet-grid-col diet-label">{row.severity}</div>
        </div>
      ))}
    </div>
  );
}
