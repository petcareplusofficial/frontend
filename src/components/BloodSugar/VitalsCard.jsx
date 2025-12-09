// src/components/BloodSugar/VitalsCard.jsx
import * as React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function VitalsCard({
  title,
  value,
  unit,
  status,
  series,
  color = "#111",
  cardWidth = "100%",
  cardHeight = 280,
  iconSrc,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Defensive: always ensure array for all computations!
  const safeSeries = Array.isArray(series) ? series : [];

  const labels = React.useMemo(
    () => safeSeries.map((_, i) => `t${i}`),
    [safeSeries]
  );

  const data = React.useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: safeSeries,
          borderColor: color,
          backgroundColor: `${color}20`,
          pointRadius: 0,
          tension: 0.45,
          fill: "start",
        },
      ],
    }),
    [labels, safeSeries, color]
  );

  const options = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: { x: { display: false }, y: { display: false } },
    }),
    []
  );

  return (
    <Card
      sx={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={isMobile ? 0 : 1}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 1 : 1.25,
          p: isMobile ? 1.25 : 2,
          flex: 1,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
          }}
        >
          {iconSrc ? (
            <Box
              component="img"
              src={iconSrc}
              alt={`${title} icon`}
              sx={{ width: { xs: 22, sm: 24 }, height: "auto" }}
            />
          ) : (
            <Box sx={{ width: { xs: 22, sm: 24 } }} />
          )}
          <Typography
            variant={isMobile ? "h6" : "subtitle1"}
            color="text.primary"
            sx={{ textAlign: "center" }}
          >
            {title}
          </Typography>
          <Box sx={{ width: { xs: 22, sm: 24 } }} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant={isMobile ? "h4" : "h3"} sx={{ lineHeight: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {unit}
            </Typography>
          </Box>
          <Typography variant="body2" color="success.main">
            {status}
          </Typography>
        </Box>
        <Box
          sx={{
            position: "relative",
            flex: "1 1 auto",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <Line data={data} options={options} />
        </Box>
      </Box>
    </Card>
  );
}
