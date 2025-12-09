import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "./HealthGrowthChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HealthGrowthChart() {
  // DELETE WHEN API IS SET - Demo data
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      {
        label: "Health Condition",
        data: [2.5, 2.8, 2.3, 2.6, 2.4, 2.7, 2.5, 2.9, 2.6, 2.4],
        borderColor: "#1E6F78",
        backgroundColor: "rgba(30, 111, 120, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#1E6F78",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "#232323",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Condition: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 1,
        max: 3,
        ticks: {
          stepSize: 0.5,
          callback: function(value) {
            const labels = { 1: "Poor", 2: "Moderate", 3: "Good" };
            return labels[value] || "";
          },
          color: "#666",
          font: {
            size: 12,
            family: "'Cabin', sans-serif"
          }
        },
        grid: {
          color: "#e0e0e0",
          drawBorder: false,
          borderDash: [5, 5]
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: {
          color: "#666",
          font: {
            size: 12,
            family: "'Cabin', sans-serif"
          }
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    }
  };

  return (
    <div className="health-growth-chart-container">
      <div className="chart-header">
        <div className="chart-title">Health Condition</div>
      </div>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}