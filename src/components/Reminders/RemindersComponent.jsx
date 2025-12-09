import React from "react";
import "./RemindersComponent.css";

export function UpcomingEventCard({
  countdown = "",
  name = "",
  date = "",
  description = "",
  children,
}) {
  return (
    <div className="upcoming-event-card">
      <div className="upcoming-event-badge">{countdown}</div>
      <div className="upcoming-event-content">
        <div className="upcoming-event-name">{name}</div>
        <div className="upcoming-event-date">{date}</div>
        <div className="upcoming-event-description">{description}</div>
        {children}
      </div>
    </div>
  );
}

export function CompletedEventCard({ name = "", description = "", children }) {
  return (
    <div className="completed-event-card">
      <div className="completed-event-content">
        <div className="completed-event-name">{name}</div>
        <div className="completed-event-description">{description}</div>
        {children}
      </div>
    </div>
  );
}

export default UpcomingEventCard;
