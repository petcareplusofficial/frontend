import "./MealCard.css";
import React from "react";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useTodayPlan } from "../../Context/DiteDetails/DiteDetails";
import BreakfastIcon from "../../icon/breakfast-generic-imageicon.svg";
import LunchIcon from "../../icon/lunch-generic-image.svg";
import DinnerIcon from "../../icon/dinner-generic-image.svg";
import MealsandSupplements from "../../icon/GenericDiteandSuppliments.svg";
import Suppliments from "../../assets/reports-page/Supplements.svg";

function getMealImage(mealType) {
  switch (mealType) {
    case "breakfast":
      return BreakfastIcon;
    case "lunch":
      return LunchIcon;
    case "dinner":
      return DinnerIcon;
    default:
      return MealsandSupplements;
  }
}

export function DietGridCard({ dailyRecords }) {
  return (
    <div className="diet-grid-card">
      {dailyRecords.length === 0 ? (
        <div className="diet-grid-empty">
          No meal records found for this period.
        </div>
      ) : (
        <div className="reports-meal-list-wrapper">
          {dailyRecords.map((dailyRecord, dateIdx) => (
            <div className="daily-meal-group" key={dateIdx}>
              <h3 className="meal-date-header">{dailyRecord.date}</h3>
              {dailyRecord.meals.map((row, mealIdx) => (
                <div className="diet-grid-row" key={mealIdx}>
                  <div className="diet-grid-col diet-label">{row.label}</div>
                  <div className="diet-grid-col diet-icon">
                    {typeof row.icon === "string" ? (
                      <span>{row.icon}</span>
                    ) : (
                      row.icon
                    )}
                  </div>
                  <div className="diet-grid-col diet-value">{row.value}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MealCard({
  mealType = "",
  calories = "",
  foodName = "",
  weight = "",
  image = "",
  onRefresh = () => {},
  isRefreshing = false,
}) {
  const { completedMeals, markMealComplete } = useTodayPlan();
  const isCompleted = !!completedMeals[mealType];
  weight = weight ? `${weight}` : "";

  return (
    <div className={`meal-card ${isRefreshing ? "refreshing" : ""}`}>
      <div className="meal-left">
        <h4 className="meal-title">{mealType}</h4>
        <p className="meal-calories">
          {calories !== "" ? `${calories} kcal` : ""}
        </p>

        <div className="meal-food">
          <img
            src={getMealImage(mealType)}
            alt={foodName}
            className="meal-image"
          />
          <div className="meal-food-info">
            <p className="meal-food-name">{foodName}</p>
            <p className="meal-weight">{weight}</p>
          </div>
        </div>
      </div>

      <div className="meal-right">
        <button
          className={`refresh-btn ${isRefreshing ? "loading" : ""}`}
          onClick={onRefresh}
          title={isRefreshing ? "Refreshing..." : "Refresh meal"}
          disabled={isCompleted || isRefreshing}
        >
          <label>Refresh Meal: </label>
          <RefreshCw size={18} className={isRefreshing ? "spin" : ""} />
        </button>

        <button
          className={`check-btn ${isCompleted ? "completed" : ""}`}
          onClick={() => markMealComplete(mealType)}
          title="Mark as complete"
          disabled={isCompleted}
        >
          <label>Mark Completed :</label>
          <CheckCircle size={20} />
        </button>
      </div>
    </div>
  );
}

export function SupplementCard({ name = "", description = "" }) {
  return (
    <div className="meal-card supplement-card">
      <div className="meal-left supplement">
        <h4 className="supplement-title ">{name}</h4>
        <div className="supplement-food">
          <img src={Suppliments} alt={name} className="meal-image" />
          <div className="supplement-food-info">
            <p className="supplement-food-name">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealCard;
