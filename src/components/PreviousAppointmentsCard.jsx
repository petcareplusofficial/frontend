import "./Cards.css";

export default function PreviousAppointmentsCard({ rows }) {
  return (
    <div className="appointments-card">
      <div className="appointments-header">Previous Appointments</div>
      <div className="appointments-list">
        {rows.map((row, idx) => (
          <div className="appointments-row" key={idx}>
            <div className="appointments-col appointments-vet">{row.vet}</div>
            <div className="appointments-col appointments-date">{row.date}</div>
            <div className="appointments-col appointments-detail">{row.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
