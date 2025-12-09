// Cards/MealsCard.jsx
import "./Cards.css";
import MealsIcon from "../../assets/reports-page/Meals.svg"; // IMPORTANT!

export default function MealsCard({ meals }) {
  return (
    <div className="vitals-card large hw-grid-card">

      {meals.map((row, idx) => (
        <div className="hw-grid-row" key={idx}>

          <div className="hw-grid-item" style={{ display: "flex", alignItems: "center" }}>
            <span className="vitals-label">{row.time}</span>

            <img
              src={MealsIcon}
              alt="Meal Icon"
              style={{
                width: 22,
                height: 22,
                marginLeft: 18,
                marginRight: 8,
              }}
            />
          </div>

          <div className="hw-grid-item" style={{ textAlign: "left" }}>
            <span className="vitals-label">{row.value}</span>
          </div>

        </div>
      ))}

    </div>
  );
}
