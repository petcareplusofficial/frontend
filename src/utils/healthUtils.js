export const HEALTH_STATUS = {
  POOR: 0,
  MODERATE: 1,
  HEALTHY: 2,
};

export function computeStatus(measurement, standard) {
  if (measurement == null || standard == null) return null;
  const diff = measurement - standard;
  if (diff >= -10 && diff <= 10) return HEALTH_STATUS.HEALTHY;
  if ((diff > 10 && diff <= 20) || (diff < -10 && diff >= -20)) {
    return HEALTH_STATUS.MODERATE;
  }
  return HEALTH_STATUS.POOR;
}

export function computeMetricStatuses(report, breedStandards) {
  if (!report || !breedStandards) return null;

  const respiratory = computeStatus(
    report.respiratoryRate,
    breedStandards.respiratory
  );
  const heart = computeStatus(report.heartRate, breedStandards.heartRate);
  const bloodPressure = computeStatus(
    report.bloodPressure,
    breedStandards.bloodPressure
  );
  const bmi = computeStatus(report.bmi, breedStandards.bmi);

  return { respiratory, heart, bloodPressure, bmi };
}

export function computeOverallHealthStatus(statuses) {
  if (!statuses) return "-";

  const values = Object.values(statuses).filter(
    (v) => v !== null && v !== undefined
  );
  if (!values.length) return "-";

  const healthyCount = values.filter((v) => v === HEALTH_STATUS.HEALTHY).length;
  const moderateCount = values.filter(
    (v) => v === HEALTH_STATUS.MODERATE
  ).length;
  const poorCount = values.filter((v) => v === HEALTH_STATUS.POOR).length;

  const total = values.length;

  if (healthyCount === total) return "Healthy";

  if (
    poorCount === 0 &&
    healthyCount >= 2 &&
    healthyCount + moderateCount === total
  ) {
    return "Healthy";
  }

  if (poorCount >= 2) {
    return "Poor";
  }

  if (poorCount >= 1 && moderateCount >= 2 && healthyCount === 0) {
    return "Poor";
  }

  return "Moderate";
}

export function computeMonthlyGraphStatus(statuses) {
  if (!statuses) return null;
  const label = computeOverallHealthStatus(statuses);
  if (label === "Healthy") return HEALTH_STATUS.HEALTHY;
  if (label === "Poor") return HEALTH_STATUS.POOR;
  if (label === "Moderate") return HEALTH_STATUS.MODERATE;
  return null;
}
