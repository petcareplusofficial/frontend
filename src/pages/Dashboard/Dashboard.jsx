import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header/header";
import DashboardCard, {
  PetProfileCard,
  AlertsCard,
  AllergyCard,
} from "../../components/Dashboard/DashboardCard/DashboardCard";
import NutritionPieChart, {
  NutritionTotalsCard,
} from "../../components/PieChart/PieChart";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api";
import { useTodayPlan } from "../../Context/DiteDetails/DiteDetails";
import { HealthConditionChart } from "../../components/LineChart/LineChart";
import "./DasboardStyle.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import {
  computeMetricStatuses,
  computeOverallHealthStatus,
  computeMonthlyGraphStatus,
} from "../../utils/healthUtils";

const MONTH_NAMES = [
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

function getShortMonthName(monthName) {
  return monthName.slice(0, 3);
}

function getVaccinationDisplayString(vaccination) {
  if (vaccination?.month && vaccination?.date) {
    return `on Month: ${vaccination.month}, Date: ${vaccination.date}`;
  }
  return "No vaccination data";
}

function getReportDate(report) {
  if (!report || !report.year || !report.month) return null;
  const monthIndex = MONTH_NAMES.indexOf(report.month);
  return new Date(report.year, monthIndex, 1);
}

export default function Dashboard() {
  const { selectedPet } = usePetContext();
  const [appointmentCount, setAppointmentCount] = useState(0);
  const { meals, completedMeals } = useTodayPlan();
  const [recentHealthReport, setRecentHealthReport] = useState(null);
  const [overallHealth, setOverallHealth] = useState("-");
  const [healthStatusDetails, setHealthStatusDetails] = useState(null);
  const [chartMonths, setChartMonths] = useState([]);
  const [chartStatuses, setChartStatuses] = useState([]);
  const [reminderList, setReminderList] = useState([]);
  const [nextVaccinationReminder, setNextVaccinationReminder] = useState(null);
  const [allergyList, setAllergyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const completedMealsList = useMemo(
    () => meals.filter((meal) => completedMeals[meal.mealType]),
    [meals, completedMeals]
  );
  const navigate = useNavigate();
  const [nutritionSummary, setNutritionSummary] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });

  useEffect(() => {
    if (!selectedPet?._id) {
      setAppointmentCount(0);
      setReminderList([]);
      setNextVaccinationReminder(null);
      setAllergyList([]);
      setRecentHealthReport(null);
      setOverallHealth("-");
      setHealthStatusDetails(null);
      setChartMonths([]);
      setChartStatuses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchAppointments = async () => {
      try {
        const api = new APIClient(`/appointments/pet/${selectedPet._id}`);
        const response = await api.get();
        const nonCancelledCount = Array.isArray(response)
          ? response.filter((apt) => apt.status !== "cancelled").length
          : 0;
        setAppointmentCount(nonCancelledCount);
      } catch {
        setAppointmentCount(0);
      }
    };
    const fetchReminders = async () => {
      try {
        const api = new APIClient(`/reminders/pet/${selectedPet._id}`);
        const response = await api.get();
        setReminderList(Array.isArray(response) ? response : []);
        const now = new Date();
        const upcomingVaccinations = (Array.isArray(response) ? response : [])
          .filter(
            (rem) =>
              rem.vaccinationId &&
              rem.vaccinationId.type &&
              rem.vaccinationId.createdAt &&
              new Date(rem.vaccinationId.createdAt) >= now
          )
          .sort(
            (a, b) =>
              new Date(a.vaccinationId.createdAt) -
              new Date(b.vaccinationId.createdAt)
          );
        setNextVaccinationReminder(
          upcomingVaccinations.length > 0 ? upcomingVaccinations[0] : null
        );
      } catch {
        setReminderList([]);
        setNextVaccinationReminder(null);
      }
    };
    const fetchAllergies = async () => {
      try {
        const api = new APIClient(`/allergies/pets/${selectedPet._id}`);
        const response = await api.get();
        setAllergyList(
          Array.isArray(response)
            ? response.map((allergy) => ({
                food: allergy.food,
                severity: allergy.severity,
                symptoms: allergy.symptoms,
              }))
            : []
        );
      } catch {
        setAllergyList([]);
      }
    };
    const fetchRecentHealthReport = async () => {
      try {
        const api = new APIClient(`/reports/pets/${selectedPet._id}/latest`);
        const report = await api.get();
        setRecentHealthReport(report);
        if (
          report &&
          report.respiratoryRate !== undefined &&
          report.month &&
          report.year
        ) {
          const breedInfo = selectedPet.breedId;
          const metricStatuses = computeMetricStatuses(report, breedInfo);
          setOverallHealth(computeOverallHealthStatus(metricStatuses));
          setHealthStatusDetails({
            month: report.month,
            year: report.year,
            statuses: metricStatuses,
            report,
            breedInfo,
          });
          const viewRange = 12;
          const periodCombos = [];
          let currentDate = getReportDate(report);
          for (let i = 0; i < viewRange; ++i) {
            if (!currentDate) break;
            const periodMonth = MONTH_NAMES[currentDate.getMonth()];
            const periodYear = currentDate.getFullYear();
            periodCombos.unshift({
              month: periodMonth,
              shortMonth: getShortMonthName(periodMonth),
              year: periodYear,
            });
            currentDate.setMonth(currentDate.getMonth() - 1);
          }
          const chartMonthNames = periodCombos.map((c) => c.shortMonth);
          setChartMonths(chartMonthNames);
          const chartRequests = periodCombos.map(({ month, year }) =>
            new APIClient(
              `/reports/pets/${selectedPet._id}?month=${month}&year=${year}`
            ).get()
          );
          const chartResponses = await Promise.allSettled(chartRequests);
          const chartStatusValues = periodCombos.map((_, idx) => {
            const res =
              chartResponses[idx].status === "fulfilled"
                ? chartResponses[idx].value
                : null;
            const reportMonth =
              Array.isArray(res) && res.length
                ? res.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  )[0]
                : res;
            if (!reportMonth || reportMonth.respiratoryRate === undefined) {
              return null;
            }
            const monthStatuses = computeMetricStatuses(reportMonth, breedInfo);
            return computeMonthlyGraphStatus(monthStatuses);
          });
          setChartStatuses(chartStatusValues);
        } else {
          setRecentHealthReport(null);
          setOverallHealth("-");
          setHealthStatusDetails(null);
          setChartMonths([]);
          setChartStatuses([]);
        }
      } catch {
        setRecentHealthReport(null);
        setOverallHealth("-");
        setHealthStatusDetails(null);
        setChartMonths([]);
        setChartStatuses([]);
      }
    };
    Promise.all([
      fetchAppointments(),
      fetchReminders(),
      fetchAllergies(),
      fetchRecentHealthReport(),
    ]).finally(() => setLoading(false));
  }, [selectedPet]);

  useEffect(() => {
    if (completedMealsList.length === 0) {
      setNutritionSummary({ calories: 0, carbs: 0, protein: 0, fat: 0 });
      return;
    }
    const totals = completedMealsList.reduce(
      (acc, meal) => ({
        calories: acc.calories + (parseInt(meal.calories) || 0),
        carbs: acc.carbs + (parseFloat(meal.carbs) || 0),
        protein: acc.protein + (parseFloat(meal.proteins) || 0),
        fat: acc.fat + (parseFloat(meal.fats) || 0),
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
    setNutritionSummary(totals);
  }, [completedMealsList]);

  const isPetSelected = !!selectedPet?._id;

  return (
    <div>
      <Header title="Dashboard" showPetSection={true} />
      {loading && <LoadingScreen message="Loading dashboard data..." />}
      {!isPetSelected ? (
        <div className="dashboard-no-pet">
          <p className="center-message">
            Let's get started by adding some pets!
          </p>
          <Button
            label="Add pet"
            onClick={() => navigate("/profile/pet/new")}
          />
        </div>
      ) : (
        <div
          className="dashboard-page-container body-main-div"
          style={loading ? { filter: "blur(2px)" } : {}}
        >
          <div className="dashboard">
            <div className="newfirstContainer">
              <Button
                label="Add pet"
                rightIcon={
                  <span className="icon">
                    <span className="add-icon-circle">+</span>
                  </span>
                }
                onClick={() => navigate("/profile/pet/new")}
              />
            </div>
            <div className="firstContainer">
              <div className="dashboard-grid">
                <DashboardCard
                  title="Pet health summary"
                  mainContent={
                    healthStatusDetails ? (
                      overallHealth
                    ) : (
                      <div className="no-data-section">
                        <Button
                          label="Add Report"
                          onClick={() =>
                            navigate("/healthreports/healthrecords/add")
                          }
                        />
                      </div>
                    )
                  }
                  subContent={
                    healthStatusDetails
                      ? `Latest checkup: ${healthStatusDetails.month}, ${healthStatusDetails.year}`
                      : ""
                  }
                />
                <DashboardCard
                  title="Appointments"
                  mainContent={
                    appointmentCount > 0 ? (
                      appointmentCount
                    ) : (
                      <div className="no-data-section">
                        <Button
                          label="Book an appointment"
                          onClick={() => navigate("/appointments")}
                        />
                      </div>
                    )
                  }
                  subContent="Vet appointment"
                />
                <DashboardCard
                  title="Latest vaccination"
                  mainContent={
                    recentHealthReport?.vaccinations?.type || (
                      <div className="no-data-section">
                        <Button
                          label="Add Report"
                          onClick={() =>
                            navigate("/healthreports/healthrecords/add")
                          }
                        />
                      </div>
                    )
                  }
                  subContent={
                    recentHealthReport?.vaccinations
                      ? getVaccinationDisplayString(
                          recentHealthReport?.vaccinations
                        )
                      : ""
                  }
                />
              </div>
              <div className="secondContainer">
                <div className="secondContainerWrapper main-box-shadow-effect-for-cards">
                  <h2>Meal and Nutrition</h2>
                  {completedMealsList.length === 0 ? (
                    <div className="no-data-section">
                      <Button
                        label="Generate diet plan"
                        onClick={() => navigate("/diteandsupplements/diteplan")}
                      />
                    </div>
                  ) : (
                    <div className="seconContainersFirstContainer">
                      <NutritionPieChart
                        carbs={nutritionSummary.carbs}
                        protein={nutritionSummary.protein}
                        fat={nutritionSummary.fat}
                      />
                      <NutritionTotalsCard
                        calories={nutritionSummary.calories}
                        carbs={nutritionSummary.carbs}
                        protein={nutritionSummary.protein}
                        fat={nutritionSummary.fat}
                      />
                    </div>
                  )}
                </div>
                <div className="secondContainerWrapper main-box-shadow-effect-for-cards">
                  <HealthConditionChart
                    months={chartMonths}
                    healthStatuses={chartStatuses}
                  />
                </div>
              </div>
              <div className="thirdContainer">
                <div className="thirdContainerWrapper main-box-shadow-effect-for-cards">
                  <div className="thirdContainerFirstChild">
                    <PetProfileCard
                      name={selectedPet?.name}
                      breed={selectedPet?.breedId?.name || "Unknown"}
                      age={selectedPet?.age}
                      gender={selectedPet?.sex}
                      image={selectedPet?.profileImageURI}
                      onProfileClick={() => navigate("/profile/pet")}
                    />
                  </div>
                </div>
                <div className="thirdContainerWrapper main-box-shadow-effect-for-cards">
                  <div className="thirdContainerSecondChild">
                    {reminderList.length > 0 ? (
                      <AlertsCard
                        alerts={reminderList
                          .filter((rem) => rem.vaccinationId)
                          .map(
                            (rem) =>
                              `${
                                rem.vaccinationId.type
                              } vaccination ${getVaccinationDisplayString(
                                rem.vaccinationId
                              )}`
                          )}
                      />
                    ) : (
                      <div className="no-data-section">
                        <Button
                          label="Check Reminders"
                          onClick={() => navigate("/healthreports/reminders")}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="thirdContainerWrapper main-box-shadow-effect-for-cards">
                  <div className="thirdContainerThirdChild">
                    {allergyList.length === 0 ? (
                      <div className="no-data-section">
                        <Button
                          label="Add allergy"
                          onClick={() =>
                            navigate("/healthreports/healthrecords/add")
                          }
                        />
                      </div>
                    ) : (
                      <AllergyCard allergies={allergyList} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
