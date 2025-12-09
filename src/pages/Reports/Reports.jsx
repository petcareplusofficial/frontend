import React, { useState, useEffect } from "react";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api";
import Header from "../../components/Header/header";
import MonthDropdown from "../../components/Dropdown/MonthDropdown";
import MedicalCard from "../../components/ReportCard/MedicalCard";
import RespirataryRate from "../../assets/reports-page/RespirataryRate.svg";
import HeartRate from "../../assets/reports-page/HeartRate.svg";
import Height from "../../assets/reports-page/Height.svg";
import Weight from "../../assets/reports-page/Weight.svg";
import BMI from "../../assets/reports-page/BMI.svg";
import BloodPressure from "../../assets/reports-page/BloodPressure.svg";
import HeightWeightCard from "../../components/Cards/HeightWeightCard";
import AllergiesCard from "../../components/AllergiesCard";
import VaccinationCard from "../../components/Cards/VaccinationCard";
import SupplementsCard from "../../components/Cards/SupplementsCard";
import { useTodayPlan } from "../../Context/DiteDetails/DiteDetails";
import { DietGridCard } from "../../components/MeelCard/MeelCard";
import pawIcon from "../../icon/paw.png";
import "./Reports.css";

import TabletIcon from "../../icon/Tablet.svg";
import MealsAndSupplementsIcon from "../../icon/Meal-Desktop.svg";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { HEALTH_STATUS, computeMetricStatuses } from "../../utils/healthUtils";

// ---------- FIXED: dynamic months for current year ----------
const buildMonthsForYear = (year) => {
  const result = [];
  for (let m = 0; m < 12; m++) {
    const label = new Date(year, m, 1).toLocaleString("default", {
      month: "long",
    });
    result.push(`${label} ${year}`);
  }
  return result;
};

const currentYear = new Date().getFullYear();
const months = buildMonthsForYear(currentYear);
// -----------------------------------------------------------

const ReportSubNav = [];

function getCurrentMonthYearString() {
  const now = new Date();
  const monthLabel = now.toLocaleString("default", { month: "long" });
  return `${monthLabel} ${now.getFullYear()}`;
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function Reports() {
  const { selectedPet } = usePetContext();
  const { supplements } = useTodayPlan();
  const petId = selectedPet?._id;

  // Set initial month to current month/year or default to first month
  const initialMonth = months.includes(getCurrentMonthYearString())
    ? getCurrentMonthYearString()
    : months[0];

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [monthsWithReports, setMonthsWithReports] = useState([]);

  // Data states
  const [vitalsData, setVitalsData] = useState([]);
  const [heightWeightRows, setHeightWeightRows] = useState([]);
  const [dailyMealRecords, setDailyMealRecords] = useState([]);
  const [supplementsRows, setSupplementsRows] = useState([]);
  const [allergiesRows, setAllergiesRows] = useState([]);
  const [vaccinationsRows, setVaccinationsRows] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map supplements from today's plan (non-month-specific)
  useEffect(() => {
    if (Array.isArray(supplements) && supplements.length > 0) {
      setSupplementsRows(
        supplements.map((supplement) => ({
          time: supplement.time || "",
          value: supplement.name || "",
          description: supplement.description || "",
          icon: (
            <img
              src={pawIcon}
              alt="paw"
              style={{ width: 22, verticalAlign: "middle" }}
            />
          ),
        }))
      );
    } else {
      setSupplementsRows([]);
    }
  }, [supplements]);

  // Main data fetching effect
  useEffect(() => {
    if (!petId) {
      setLoading(false);
      setError("Please select a pet to view reports.");
      return;
    }

    setLoading(true);
    setError(null);

    const [month, year] = selectedMonth.split(" ");
    const apiPath = `/reports/pets/${petId}?month=${month}&year=${year}`;
    const allergyPath = `/allergies/pets/${petId}`;
    const mealHistoryApiPath = `/meals-history/pets/${petId}?time=lastYear`;

    const reportsAPI = new APIClient(apiPath);
    const allergiesAPI = new APIClient(allergyPath);
    const mealHistoryAPI = new APIClient(mealHistoryApiPath);

    const fetchAllData = async () => {
      try {
        const [data, allergies, history] = await Promise.all([
          reportsAPI.get(),
          allergiesAPI.get(),
          mealHistoryAPI.get(),
        ]);

        const historyArr = Array.isArray(history) ? history : [];

        const report = Array.isArray(data) ? data[0] : data || {};

        // 1. Determine Months with Reports (for Dropdown coloring)
        const monthsInHistory = new Set();
        historyArr.forEach((item) => {
          const d = new Date(item.consumedAt);
          if (!Number.isNaN(d.getTime())) {
            const key = `${d.toLocaleString("default", {
              month: "long",
            })} ${d.getFullYear()}`;
            if (months.includes(key)) {
              monthsInHistory.add(key);
            }
          }
        });
        if (report && Object.keys(report).length > 0) {
          const key = `${report.month} ${report.year}`;
          if (months.includes(key)) {
            monthsInHistory.add(key);
          }
        }
        setMonthsWithReports(Array.from(monthsInHistory));

        // 2. Vitals / Measurements / Vaccinations (from the main report object)

        const metricStatuses =
          report && selectedPet?.breedId
            ? computeMetricStatuses(report, selectedPet.breedId)
            : null;

        const mapVitalStatus = (metricKey, value) => {
          if (value == null || value === "N/A") return "N/A";
          const statusCode = metricStatuses ? metricStatuses[metricKey] : null;
          if (statusCode === HEALTH_STATUS.HEALTHY) return "Normal";
          if (statusCode === HEALTH_STATUS.MODERATE) return "Low";
          if (statusCode === HEALTH_STATUS.POOR) return "High";
          return "N/A";
        };

        // Vitals
        setVitalsData([
          {
            icon: (
              <img
                src={RespirataryRate}
                alt="Respiratory Rate"
                style={{ width: 50, height: 50 }}
              />
            ),
            label: "Respiratory Rate",
            value: report?.respiratoryRate ?? "N/A",
            unit: "breaths/min",
            status: mapVitalStatus("respiratory", report?.respiratoryRate),
          },
          {
            icon: (
              <img
                src={HeartRate}
                alt="HeartRate"
                style={{ width: 50, height: 50 }}
              />
            ),
            label: "Heart Rate",
            value: report?.heartRate ?? "N/A",
            unit: "bpm",
            status: mapVitalStatus("heart", report?.heartRate),
          },
          {
            icon: (
              <img
                src={BloodPressure}
                alt="BloodPressure"
                style={{ width: 50, height: 50 }}
              />
            ),
            label: "Blood Pressure",
            value: report?.bloodPressure ?? "N/A",
            unit: "mmHg",
            status: mapVitalStatus("bloodPressure", report?.bloodPressure),
          },
        ]);

        // Height / Weight / BMI
        setHeightWeightRows([
          {
            icon: (
              <img
                src={Height}
                alt="Height"
                style={{ width: 50, height: 50 }}
              />
            ),
            label: "Height",
            value: report?.height ? `${report.height} cm` : "N/A",
          },
          {
            icon: <img src={BMI} alt="BMI" style={{ width: 50, height: 50 }} />,
            label: "BMI",
            value:
              typeof report?.bmi === "number" || typeof report?.bmi === "string"
                ? report.bmi
                : "N/A",
          },
          {
            icon: (
              <img
                src={Weight}
                alt="Weight"
                style={{ width: 50, height: 50 }}
              />
            ),
            label: "Weight",
            value: report?.weight ? `${report.weight} kg` : "N/A",
          },
        ]);

        // Vaccinations
        let vaccines = [];
        if (Array.isArray(report?.vaccinations)) {
          vaccines = report.vaccinations.map((vacc) => ({
            type: vacc.type,
            place: vacc.place,
            date: vacc.date,
            icon: "💉",
          }));
        } else if (report?.vaccinations) {
          const v = report.vaccinations;
          vaccines = [
            { type: v.type, place: v.place, date: v.date, icon: "💉" },
          ];
        }
        setVaccinationsRows(vaccines);

        // 3. Meals history for the selected month (from history object)
        const [monthName, yearnum] = selectedMonth.split(" ");
        const monthIdx = new Date(`${monthName} 1, 2000`).getMonth();
        const yearNum = parseInt(yearnum, 10);

        const filteredHistory = historyArr.filter((item) => {
          const date = new Date(item.consumedAt);
          return (
            !Number.isNaN(date.getTime()) &&
            date.getFullYear() === yearNum &&
            date.getMonth() === monthIdx
          );
        });

        const dailyMealsMap = new Map();
        filteredHistory.forEach((meal) => {
          const dateKey = formatDate(meal.consumedAt);
          if (!dateKey) return;
          if (!dailyMealsMap.has(dateKey)) {
            dailyMealsMap.set(dateKey, []);
          }
          dailyMealsMap.get(dateKey).push({
            label: meal.mealType
              ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
              : "",
            icon: (
              <img
                src={pawIcon}
                alt="paw"
                style={{ width: 22, verticalAlign: "middle" }}
              />
            ),
            value: meal.name || "",
          });
        });

        const groupedMeals = Array.from(dailyMealsMap.entries()).map(
          ([date, meals]) => ({ date, meals })
        );
        setDailyMealRecords(groupedMeals);

        // 4. Allergies (from allergies object)
        const allergiesArr = Array.isArray(allergies) ? allergies : [];
        const allergiesRowsMapped = allergiesArr.map((allergy) => ({
          type: allergy.food || allergy.type || "",
          severity: allergy.severity || "",
          symptoms: allergy.symptoms || "",
          date: allergy.date
            ? new Date(allergy.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
          icon: (
            <img
              src={pawIcon}
              alt="paw"
              style={{ width: 22, verticalAlign: "middle" }}
            />
          ),
        }));
        setAllergiesRows(allergiesRowsMapped);

        setLoading(false);
      } catch (err) {
        console.error("Reports fetch error:", err);
        setError("Failed to load report data due to an API error.");

        setVitalsData([]);
        setHeightWeightRows([]);
        setDailyMealRecords([]);
        setAllergiesRows([]);
        setVaccinationsRows([]);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedMonth, petId, selectedPet?._id, supplements]);

  if (loading) {
    return (
      <>
        <Header title="Reports" showPetSection={true} />
        <LoadingScreen message="Loading report..." />
      </>
    );
  }

  return (
    <>
      <Header
        title="Reports"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={ReportSubNav}
      />
      <main className="reports-main body-main-div">
        {error && (
          <div
            style={{
              color: "#cc0000",
              backgroundColor: "#ffebee",
              padding: "12px 24px",
              borderRadius: "8px",
              marginBottom: 20,
              border: "1px solid #cc0000",
            }}
          >
            <strong>API Error:</strong> {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <MonthDropdown
            months={months}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            monthsWithReports={monthsWithReports}
          />
        </div>

        {/* Vitals and Measurements Row */}
        <div className="reports-top-row" style={{ marginBottom: "37px" }}>
          <div className="reports-medical reports-h2">
            <h2 className="text-xl font-semibold mb-4">Vitals</h2>
            <MedicalCard vitals={vitalsData} />
          </div>
          <div className="reports-height-weight reports-h2">
            <h2 className="text-xl font-semibold mb-4">Measurements</h2>
            <HeightWeightCard rows={heightWeightRows} />
          </div>
        </div>

        {/* Diet Plan */}
        <h2 className="text-xl font-semibold mb-4 reports-h2">Diet Plan</h2>

        <div
          className="reports-middle-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "38px",
          }}
        >
          {/* Meals Card */}
          <div className="reports-meals reports-h2">
            <h2 className="text-xl font-semibold mb-4">
              <img
                src={MealsAndSupplementsIcon}
                alt="Meals"
                className="reports-heading-icon"
              />
              Meals
            </h2>
            <DietGridCard dailyRecords={dailyMealRecords} />
          </div>

          {/* Supplements Card */}
          <div className="reports-suppliments reports-h2">
            <h2 className="text-xl font-semibold mb-4">
              <img
                src={TabletIcon}
                alt="Supplements"
                className="reports-heading-icon"
              />
              Supplements
            </h2>
            <SupplementsCard supplements={supplementsRows} />
          </div>
        </div>

        {/* Allergies */}
        <div className="allergies-full-row" style={{ marginBottom: "38px" }}>
          <h2 className="text-xl font-semibold mb-4">Allergies</h2>
          <AllergiesCard rows={allergiesRows} />
        </div>

        {/* Vaccinations */}
        <div className="vaccinations-full-row" style={{ marginBottom: "38px" }}>
          <h2 className="text-xl font-semibold mb-4">Vaccinations</h2>
          <VaccinationCard rows={vaccinationsRows} />
        </div>
      </main>
    </>
  );
}
