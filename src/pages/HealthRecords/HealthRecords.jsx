import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api";
import locations from "../../assets/pet-health/location.svg";
import heartRates from "../../assets/reports-page/HeartRate.svg";
import BloodPressureIcon from "../../assets/reports-page/BloodPressure.svg";
import RespiratoryIcon from "../../assets/reports-page/RespirataryRate.svg";
import SymptomsIcon from "../../assets/pet-health/SymptomsIcon.svg";
import AllergyIcon from "../../assets/pet-health/AllergyIcon.svg";
import SeverityIcon from "../../assets/pet-health/SeverityIcon.svg";
import Header from "../../components/Header/header";
import Button from "../../components/Button/Button";
import { HealthConditionChart } from "../../components/LineChart/LineChart";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import "./HealthRecords.css";
import {
  computeMetricStatuses,
  computeMonthlyGraphStatus,
} from "../../utils/healthUtils";

export const HealthReportsSubNav = [
  { icon: "", label: "Health Records", to: "/healthreports/healthrecords" },
  { icon: "", label: "Reminders", to: "/healthreports/reminders" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getShortMonth = (month) => month.slice(0, 3);

const getVaccinationDisplayData = (v) => {
  if (!v || !v.month || !v.date) {
    return { month: "Unknown", day: "", type: "", location: "" };
  }
  return {
    month: v.month,
    day: String(v.date),
    type: v.type || "General",
    location: v.place || "Unknown",
  };
};

function VitalsCard({ SvgIcon, icon, label, value, unit, status }) {
  return (
    <div className="vital-card">
      <div className="vital-icon">
        {SvgIcon ? (
          <img src={SvgIcon} alt={label} className="vitals-icon-svg" />
        ) : (
          icon
        )}
      </div>
      <div className="vital-info">
        <div className="vital-label">{label}</div>
        <div className={`vital-value ${value}`}>
          <span className="value">{value}</span>
          <span className="unit">{unit}</span>
        </div>
        <div className={`vital-status ${status}`}>{status}</div>
      </div>
      <div className="vital-graph">
        <svg
          width="100%"
          height="60"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 Q25,20 50,25 T100,30"
            fill="rgba(30, 111, 120, 0.2)"
            stroke="#1E6F78"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

function VaccinationCard({ month, day, location, type }) {
  return (
    <div className="vaccination-display-card">
      <div className="vacc-card">
        <div className="vacc-card-label">Location</div>
        <div className="vacc-card-icon">
          <img src={locations} alt="Location Icon" className="vacc-icon-svg" />
        </div>
        <div className="vacc-card-value">{location || "Unknown"}</div>
      </div>
      <div className="vacc-card">
        <div className="vacc-card-label">Type</div>
        <div className="vacc-card-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="vacc-icon-svg"
          >
            <path
              d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
              stroke="#1E6F78"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M8 12L16 12M12 8L12 16"
              stroke="#1E6F78"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="vacc-card-value">{type || "General"}</div>
      </div>
      <div className="vacc-card">
        <div className="vacc-card-label">Vaccinated On</div>
        <div className="vacc-card-date-large">{day || ""}</div>
        <div className="vacc-card-value">{month || "Unknown"}</div>
      </div>
    </div>
  );
}

function NotesCard({ height, weight, bmi, bmiStatus }) {
  const getHighlightedLine = (v, max = 100) =>
    Math.floor((parseInt(v) / max) * 7);
  const heightHighlight = getHighlightedLine(parseInt(height), 100);
  const weightHighlight = getHighlightedLine(parseInt(weight), 50);
  const getBMIPosition = (b) => {
    const min = 15;
    const max = 40;
    const val = parseFloat(b);
    const cVal = Math.min(Math.max(val, min), max);
    return ((cVal - min) / (max - min)) * 100;
  };
  return (
    <div className="notes-display-card">
      <div className="notes-metrics-row">
        <div className="metric-card">
          <div className="metric-lines">
            {[...Array(7)].map((_, i) => (
              <div
                key={`weight-${i}`}
                className={`metric-line ${
                  i === weightHighlight ? "highlighted" : ""
                }`}
              />
            ))}
          </div>
          <div className="metric-text">
            <span className="metric-label">Weight</span>
            <span className="metric-value">{weight}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-lines">
            {[...Array(7)].map((_, i) => (
              <div
                key={`height-${i}`}
                className={`metric-line ${
                  i === heightHighlight ? "highlighted" : ""
                }`}
              />
            ))}
          </div>
          <div className="metric-text">
            <span className="metric-label">Height</span>
            <span className="metric-value">{height}</span>
          </div>
        </div>
      </div>
      <div className="bmi-section">
        <div className="bmi-header">
          <div className="bmi-title">Body Mass Index (BMI)</div>
          <div className="bmi-value-display">{bmi}</div>
          {bmiStatus && <span className="bmi-status-badge">{bmiStatus}</span>}
        </div>
        <div className="bmi-scale-container">
          <div className="bmi-scale">
            <div
              className="bmi-marker"
              style={{ left: `${getBMIPosition(bmi)}%` }}
            />
          </div>
          <div className="bmi-scale-labels">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllergyDisplayCard({ type, severity, symptoms }) {
  if (!type && !severity && !symptoms)
    return (
      <div className="allergy-display-cards no-data">
        <p>No allergy information recorded</p>
      </div>
    );
  return (
    <div className="allergy-display-cards">
      {type && (
        <div className="allergy-display-item">
          <img
            src={AllergyIcon}
            alt="Allergy"
            className="allergy-display-icon-svg"
          />
          <div className="allergy-display-label">Allergy</div>
          <div className="allergy-display-value">{type}</div>
        </div>
      )}
      {severity && (
        <div className="allergy-display-item">
          <img
            src={SeverityIcon}
            alt="Severity"
            className="allergy-display-icon-svg"
          />
          <div className="allergy-display-label">Severity</div>
          <div className="allergy-display-value">{severity}</div>
        </div>
      )}
      {symptoms && (
        <div className="allergy-display-item">
          <img
            src={SymptomsIcon}
            alt="Symptoms"
            className="allergy-display-icon-svg"
          />
          <div className="allergy-display-label">Symptoms</div>
          <div className="allergy-display-value">{symptoms}</div>
        </div>
      )}
    </div>
  );
}

export function HealthRecords() {
  const navigate = useNavigate();
  const { selectedPet } = usePetContext();
  const [latestReport, setLatestReport] = useState(null);
  const [graphMonths, setGraphMonths] = useState([]);
  const [graphStatuses, setGraphStatuses] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!selectedPet || !selectedPet._id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const healthApi = new APIClient(
          `/reports/pets/${selectedPet._id}/latest`
        );
        const report = await healthApi.get();
        setLatestReport(report);
        if (
          report &&
          report.respiratoryRate !== undefined &&
          report.month &&
          report.year &&
          selectedPet.breedId
        ) {
          const breed = selectedPet.breedId;
          const lookback = 12;
          const combos = [];
          let baseMonthIdx = MONTHS.indexOf(report.month);
          let baseYear = report.year;
          for (let i = lookback - 1; i >= 0; --i) {
            let mIdx = baseMonthIdx - i;
            let year = baseYear;
            while (mIdx < 0) {
              mIdx += 12;
              year -= 1;
            }
            const month = MONTHS[mIdx];
            combos.push({ month, shortMonth: getShortMonth(month), year });
          }
          const graphMonthsArr = combos.map((c) => c.shortMonth);
          setGraphMonths(graphMonthsArr);
          const requests = combos.map(({ month, year }) =>
            new APIClient(
              `/reports/pets/${selectedPet._id}?month=${month}&year=${year}`
            ).get()
          );
          const responses = await Promise.allSettled(requests);
          const graphStatusesArr = combos.map((_, idx) => {
            const resp =
              responses[idx].status === "fulfilled"
                ? responses[idx].value
                : null;
            const reportForMonth =
              Array.isArray(resp) && resp.length
                ? resp.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  )[0]
                : resp;
            if (
              !reportForMonth ||
              reportForMonth.respiratoryRate === undefined
            ) {
              return null;
            }
            const monthStatuses = computeMetricStatuses(reportForMonth, breed);
            return computeMonthlyGraphStatus(monthStatuses);
          });
          setGraphStatuses(graphStatusesArr);
        } else {
          setGraphMonths([]);
          setGraphStatuses([]);
        }
        try {
          const allergiesAPI = new APIClient(
            `/allergies/pets/${selectedPet._id}`
          );
          const allergyData = await allergiesAPI.get();
          setAllergies(Array.isArray(allergyData) ? allergyData : []);
        } catch {
          setAllergies([]);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load health records");
        setLoading(false);
      }
    };
    fetchHealthData();
  }, [selectedPet]);

  const handleAddReport = () => {
    navigate("/healthreports/healthrecords/add");
  };

  const latestAllergy = allergies.length > 0 ? allergies[0] : null;

  const metricStatuses =
    latestReport && selectedPet?.breedId
      ? computeMetricStatuses(latestReport, selectedPet.breedId)
      : null;

  const mapVitalStatusLabel = (metricKey, value) => {
    if (!value || value === 0) return "Not Recorded";
    const statusCode = metricStatuses ? metricStatuses[metricKey] : null;
    if (statusCode === 2) return "Normal";
    if (statusCode === 1) return "Elevated";
    if (statusCode === 0) return "Abnormal";
    return "Unknown";
  };

  const currentRecord = latestReport
    ? {
        medical: {
          respiratoryRate: {
            value: latestReport.respiratoryRate || 0,
            unit: "bpm",
            status: mapVitalStatusLabel(
              "respiratory",
              latestReport.respiratoryRate
            ),
          },
          heartRate: {
            value: latestReport.heartRate || 0,
            unit: "bpm",
            status: mapVitalStatusLabel("heart", latestReport.heartRate),
          },
          bloodPressure: {
            value: latestReport.bloodPressure || 0,
            unit: "mmHg",
            status: mapVitalStatusLabel(
              "bloodPressure",
              latestReport.bloodPressure
            ),
          },
        },
        vaccination: getVaccinationDisplayData(latestReport?.vaccinations),
        notes: {
          height: `${latestReport.height} cm`,
          weight: `${latestReport.weight} Kg`,
          bmi: latestReport.bmi ? latestReport.bmi.toFixed(1) : "",
          bmiStatus: null,
        },
        allergy: latestAllergy
          ? {
              type: latestAllergy.food || null,
              severity: latestAllergy.severity || null,
              symptoms: latestAllergy.symptoms || null,
            }
          : {
              type: null,
              severity: null,
              symptoms: null,
            },
      }
    : null;

  const hasLatest = !!latestReport;
  const hasAllergies = allergies.length > 0;

  return (
    <>
      <Header
        title="Pet Health"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={HealthReportsSubNav}
      />
      {loading && <LoadingScreen message="Loading Health Records..." />}
      <main
        className="healthrecords-page"
        style={loading ? { filter: "blur(2px)" } : {}}
      >
        <div>
          <Button
            label="Add Report"
            type="add-health-report"
            onClick={handleAddReport}
            rightIcon={<span className="add-icon-circle">+</span>}
          />
        </div>
        {loading ? (
          <></>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : !hasLatest && !hasAllergies ? (
          <div className="no-reports-state">
            <p>No Reports are here to show</p>
            <p style={{ fontSize: "14px", marginTop: "10px", color: "#666" }}>
              Click "Add Report" to create your first health record
            </p>
          </div>
        ) : (
          <div className="health-records-display">
            {hasLatest && (
              <>
                <section className="medical-vitals-section">
                  <h2 className="section-heading">Medical</h2>
                  <div className="vitals-grid">
                    <VitalsCard
                      SvgIcon={BloodPressureIcon}
                      label="Blood Pressure"
                      value={currentRecord.medical.bloodPressure.value}
                      unit={currentRecord.medical.bloodPressure.unit}
                      status={currentRecord.medical.bloodPressure.status}
                    />
                    <VitalsCard
                      SvgIcon={RespiratoryIcon}
                      label="Respiratory Rate"
                      value={currentRecord.medical.respiratoryRate.value}
                      unit={currentRecord.medical.respiratoryRate.unit}
                      status={currentRecord.medical.respiratoryRate.status}
                    />
                    <VitalsCard
                      SvgIcon={heartRates}
                      label="Heart Rate"
                      value={currentRecord.medical.heartRate.value}
                      unit={currentRecord.medical.heartRate.unit}
                      status={currentRecord.medical.heartRate.status}
                    />
                  </div>
                </section>
                {currentRecord.vaccination && (
                  <section className="vaccination-display-section">
                    <h2 className="section-heading">Vaccination</h2>
                    <VaccinationCard {...currentRecord.vaccination} />
                  </section>
                )}
                <section className="notes-display-section">
                  <h2 className="section-heading">Notes</h2>
                  <NotesCard {...currentRecord.notes} />
                </section>
                <section className="health-growth-display-section">
                  <h2 className="section-heading">Health Growth</h2>
                  <HealthConditionChart
                    months={graphMonths}
                    healthStatuses={graphStatuses}
                  />
                </section>
              </>
            )}
            {!hasLatest && hasAllergies && (
              <div
                className="no-reports-state"
                style={{ marginBottom: "2rem" }}
              >
                <p>No health reports for this year</p>
                <p
                  style={{ fontSize: "14px", marginTop: "10px", color: "#666" }}
                >
                  Click "Add Report" to create a health record
                </p>
              </div>
            )}
            <section className="allergy-display-section">
              <h2 className="section-heading">Allergy</h2>
              <AllergyDisplayCard
                {...(latestAllergy
                  ? {
                      type: latestAllergy.food || null,
                      severity: latestAllergy.severity || null,
                      symptoms: latestAllergy.symptoms || null,
                    }
                  : {
                      type: null,
                      severity: null,
                      symptoms: null,
                    })}
              />
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default HealthRecords;
