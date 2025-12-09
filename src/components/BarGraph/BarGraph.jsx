import { Bar } from "react-chartjs-2";

import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export function DietHistoryChart({ labels, targetData, achievedData }) {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Target",
        data: targetData,
        backgroundColor: "rgba(200,200,200,0.8)",
      },
      {
        label: "Achieved",
        data: achievedData,
        backgroundColor: "#21777e",
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Diet History",
        font: { size: 22 },
      },
    },
    scales: {
      x: { ticks: { rotate: 45 } },
      y: {
        beginAtZero: true,
        max: 900,
        title: {
          display: true,
          text: "Diet in KCalories",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default DietHistoryChart;
