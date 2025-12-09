import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import { usePetContext } from "../../hooks/usePetContext";
import { useNavigate } from "react-router-dom";

export function WeightComparisonChart({ petWeights, breedAvgWeights, months }) {
  const { selectedPet } = usePetContext();
  const data = {
    labels: months,
    datasets: [
      {
        label: `pets's weight`,
        data: petWeights,
        borderColor: "#222",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        spanGaps: true,
      },
      {
        label: `Breed's avg weight`,
        data: breedAvgWeights,
        borderColor: "#222",
        borderDash: [8, 4],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#222",
          usePointStyle: true,
          font: { size: 14, family: "inherit" },
        },
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 80,
        ticks: {
          stepSize: 10,
          color: "#222",
          font: { size: 14, family: "inherit" },
        },
        grid: { color: "#eee" },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#666",
          font: { size: 15, family: "inherit" },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export function RecommendationCard({ recommendations }) {
  return (
    <section>
      <h2>Key recommendations</h2>
      {recommendations.map((rec, idx) => (
        <div key={idx} className="recommendation-card">
          {rec}
        </div>
      ))}
    </section>
  );
}

export function AiInsightCard({ insight }) {
  return (
    <section>
      <h2>AI insights for Buddy</h2>
      <div className="ai-insight-card">{insight}</div>
    </section>
  );
}

export function HealthConditionChart({ months, healthStatuses }) {
  const navigate = useNavigate;
  const STATUS_LABELS = ["Poor", "Moderate", "Healthy"];
  const data = {
    labels: months,
    datasets: [
      {
        label: "Health Condition",
        data: healthStatuses,
        borderColor: "#016979",
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(
            0,
            0,
            0,
            context.chart.height
          );
          gradient.addColorStop(0, "rgba(1, 105, 121, 0.18)");
          gradient.addColorStop(1, "rgba(1, 105, 121, 0)");
          return gradient;
        },
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: "#016979",
        pointBorderColor: "#016979",
        tension: 0.3,
        borderWidth: 3,
        spanGaps: true,
      },
    ],
  };
  const options = {
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => STATUS_LABELS[ctx.parsed.y] || ctx.parsed.y,
        },
      },
    },
    scales: {
      y: {
        min: -1,
        max: 3,
        ticks: {
          stepSize: 1,
          callback: (val) =>
            Number.isInteger(val) && STATUS_LABELS[val]
              ? STATUS_LABELS[val]
              : "",
          color: "#666",
          font: { size: 15, family: "inherit" },
        },
        grid: { color: "#eee" },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#666",
          font: { size: 15, family: "inherit" },
        },
      },
    },
    elements: {
      line: { borderJoinStyle: "round" },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  const hasOne =
    healthStatuses.filter((v) => v !== null && v !== undefined).length > 0;
  return (
    <div
      style={{ width: "100%", height: 250, paddingTop: 18, paddingBottom: 12 }}
    >
      <h2>Health Condition</h2>
      {hasOne ? (
        <div style={{ maxWidth: "640px", height: "200px" }}>
          <Line data={data} options={options} />
        </div>
      ) : (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
          }}
        >
          No health data available
        </div>
      )}
    </div>
  );
}

export default WeightComparisonChart;
