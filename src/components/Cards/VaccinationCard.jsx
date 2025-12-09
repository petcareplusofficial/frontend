import React from "react";
import "./Cards.css"; // Ensure import!

export default function VaccinationCard({ rows }) {
  return (
    <div className="hw-allergy-card">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "10% 1fr 1fr 1fr",
          fontWeight: "bold",
          fontSize: "1.07rem",
          marginBottom: 10,
          color: "#232323",
        }}
      >
        <div></div>
        <div>Vaccination Type</div>
        <div>Place</div>
        <div>Date</div>
      </div>
      {rows && rows.length > 0 ? (
        rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "10% 1fr 1fr 1fr",
              alignItems: "center",
              padding: "9px 0",
              borderBottom: i < rows.length - 1 ? "1px solid #eee" : "none",
            }}
          >
            <span style={{ marginRight: "12px", fontSize: "1.2em" }}>
              {row.icon || "🐾"}
            </span>
            <span>{row.type}</span>
            <span>{row.place}</span>
            <span>
              {row.date
                ? new Date(row.date).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>
        ))
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            padding: "18px 0",
            gridColumn: "span 3",
          }}
        >
          No vaccination records found.
        </div>
      )}
    </div>
  );
}
