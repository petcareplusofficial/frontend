// Expects rows = [{icon, label, value}, {label, value}, {icon, label, value}]
export default function MealsCard({ rows }) {
  // Provide default demo data if no rows provided
  const defaultRows = [
    { icon: "🍳", label: "Breakfast", value: "8:30 AM" },
    { label: "Lunch", value: "1:00 PM" },
    { icon: "🍲", label: "Dinner", value: "7:30 PM" },
  ];

  const displayRows = rows || defaultRows;

  return (
    <div className="hw-grid-card">
      {/* First row: Breakfast + Lunch */}
      <div className="hw-grid-row">
        <div className="hw-grid-item">
          {displayRows[0]?.icon && (
            <span className="vitals-icon" style={{ fontSize: 28 }}>
              {displayRows[0].icon}
            </span>
          )}
          <div>
            <div className="vitals-label">{displayRows[0]?.label}</div>
            <div style={{ fontSize: 16, marginTop: 2 }}>
              {displayRows[0]?.value}
            </div>
          </div>
        </div>
        <div className="hw-grid-item" style={{ textAlign: "right" }}>
          <div className="vitals-label">{displayRows[1]?.label}</div>
          <div style={{ fontSize: 16, marginTop: 2 }}>
            {displayRows[1]?.value}
          </div>
        </div>
      </div>

      {/* Second row: Dinner */}
      <div className="hw-grid-row">
        <div className="hw-grid-item">
          {displayRows[2]?.icon && (
            <span className="vitals-icon" style={{ fontSize: 28 }}>
              {displayRows[2].icon}
            </span>
          )}
          <div>
            <div className="vitals-label">{displayRows[2]?.label}</div>
            <div style={{ fontSize: 16, marginTop: 2 }}>
              {displayRows[2]?.value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
