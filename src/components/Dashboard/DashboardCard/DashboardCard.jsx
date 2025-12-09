import React from "react";
import "./DashboardCard.css";
import Vector from "../../../icon/Vector.png";
import { all } from "axios";

export function DashboardCard({
  title,
  mainContent,
  subContent,
  variant = "default",
}) {
  return (
    <div
      className={`dashboard-card dashboard-card-${variant} main-box-shadow-effect-for-cards`}
    >
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">{title}</h3>
      </div>

      <div className="dashboard-card-body">
        <div className={`dashboard-card-value ${mainContent}`}>
          {mainContent}
        </div>
        {subContent && (
          <div className="dashboard-card-footer">{subContent}</div>
        )}
      </div>
    </div>
  );
}

export function PetProfileCard({
  name,
  breed,
  age,
  gender,
  image,
  onProfileClick,
}) {
  return (
    <div className="petProfileCard">
      <img src={image || "/placeholder.png"} alt={name} className="petImage" />
      <h2>{name}</h2>
      <div className="petBreed">{breed}</div>
      <div className="petStats">
        <span>
          Age
          <br />
          {age}yrs
        </span>
        <span>
          Identified As
          <br />
          {gender}
        </span>
      </div>
      <button className="profileButton" onClick={onProfileClick}>
        View profile
      </button>
    </div>
  );
}

export function AlertsCard({ alerts }) {
  return (
    <div className="alertsCard">
      <h3>Alerts</h3>
      {alerts.map((msg, idx) => (
        <div className="alertContainer">
          <div className="alertStyler"></div>
          <div className="alertItem" key={idx}>
            Alert: {msg}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AllergyCard({ allergies }) {
  return (
    <div className="allergyCard">
      <div>
        <h3>Allergies</h3>

        <div className="allergyList">
          {allergies.map((allergy, index) => (
            <div className="allergyItem" key={index}>
              <div className="allergyName">{allergy.food}</div>
              <div className="allergyIcon">
                <img src={Vector} alt="Allergy Icon" />
              </div>
              <div className="allergySeverity">{allergy.severity}</div>
              <div className="allergySymptoms">{allergy.symptoms}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
