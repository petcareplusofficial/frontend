import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

import "./PieChart.css";

export function NutritionPieChart({ carbs, protein, fat }) {
  const data = {
    labels: ["Carbs", "Protein", "Fat"],
    datasets: [
      {
        data: [carbs, protein, fat],
        backgroundColor: ["#18869c", "#81c784", "#ffb74d"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" },
    },
  };

  return (
    <div className="chart-container">
      <Pie data={data} options={options} />
    </div>
  );
}

export function NutritionTotalsCard({ calories, carbs, protein, fat }) {
  return (
    <div className="card NutritionTotalsCard">
      <div className="cardTitle">Totals</div>
      <ul className="list">
        <div className="NutritionTotalsCardFirstList ListItems">
          <li>
            <strong>Calories:</strong>
          </li>
          <li className="ListItemsValue">{calories}</li>
        </div>
        <div className="NutritionTotalsCardSecondList ListItems">
          <li>
            <strong>Carbs:</strong>
          </li>
          <li className="ListItemsValue">{carbs}gm</li>
        </div>
        <div className="NutritionTotalsCardThirdList ListItems">
          <li>
            <strong>Protein:</strong>
          </li>
          <li className="ListItemsValue">{protein}gm</li>
        </div>
        <div className="NutritionTotalsCardFourthList ListItems">
          <li>
            <strong>Fat:</strong>
          </li>
          <li className="ListItemsValue">{fat}gm</li>
        </div>
      </ul>
    </div>
  );
}

export default NutritionPieChart;
