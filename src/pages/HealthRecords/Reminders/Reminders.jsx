import React, { useEffect, useState } from "react";
import Header from "../../../components/Header/header";
import { HealthReportsSubNav } from "../HealthRecords";
import { usePetContext } from "../../../hooks/usePetContext";
import APIClient from "../../../api/Api";
import UpcomingEventCard, {
  CompletedEventCard,
} from "../../../components/Reminders/RemindersComponent";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";

function formatDate(dateStr) {
  return dateStr
    ? new Date(dateStr).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No date";
}

function getCountdown(dateStr) {
  if (!dateStr) return "";
  const today = new Date();
  const date = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Past date";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `in ${diff} Days`;
}

export function Reminders() {
  const { selectedPet } = usePetContext();
  const petId = selectedPet?._id;
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!petId) {
      setAppointments([]);
      setReminders([]);
      setCompletedVaccinations([]);
      return;
    }
    setLoading(true);
    const fetchAppointments = async () => {
      try {
        const api = new APIClient(`/appointments/pet/${petId}?status=pending`);
        const data = await api.get();
        setAppointments(Array.isArray(data) ? data : []);
      } catch {
        setAppointments([]);
      }
    };

    const fetchReminders = async () => {
      try {
        const api = new APIClient(`/reminders/pet/${petId}`);
        const data = await api.get();
        setReminders(Array.isArray(data) ? data : []);
      } catch {
        setReminders([]);
      }
    };

    const fetchCompletedVaccinations = async () => {
      try {
        const api = new APIClient(
          `/reminders/pet/${petId}/vaccinationshistory`
        );
        const data = await api.get();
        setCompletedVaccinations(Array.isArray(data) ? data : []);
      } catch {
        setCompletedVaccinations([]);
      }
    };

    Promise.all([
      fetchAppointments(),
      fetchReminders(),
      fetchCompletedVaccinations(),
    ]).finally(() => setLoading(false));
  }, [petId]);

  function handleCompleteVaccination(petId, vaccinationId) {
    setLoading(true);
    const api = new APIClient(
      `/reminders/pet/${petId}/vaccinations/${vaccinationId}`,
      { method: "POST" }
    );
    api
      .post()
      .then(() => {
        const fetchReminders = async () => {
          try {
            const api = new APIClient(`/reminders/pet/${petId}`);
            const data = await api.get();
            setReminders(Array.isArray(data) ? data : []);
          } catch {
            setReminders([]);
          } finally {
            setLoading(false);
          }
        };
        fetchReminders();
      })
      .catch(() => setLoading(false));
  }

  const renderReminders = () =>
    reminders.length > 0 ? (
      reminders
        .filter((rem) => rem.vaccinationId && rem.vaccinationId.type)
        .map((rem, idx) => {
          const vaccination = rem.vaccinationId;
          const dueDate = vaccination.createdAt;
          const type = vaccination.type;
          const desc = "vaccination";
          return (
            <UpcomingEventCard
              key={rem._id || idx}
              countdown={getCountdown(dueDate)}
              name={type}
              date={formatDate(dueDate)}
              description={desc}
              details={rem.details || null}
            >
              <button
                className="complete-vaccination-button"
                onClick={() =>
                  handleCompleteVaccination(petId, vaccination._id)
                }
              >
                Complete
              </button>
            </UpcomingEventCard>
          );
        })
    ) : (
      <p>No reminders at this time.</p>
    );

  const renderCompletedVaccinations = () =>
    completedVaccinations.length > 0 ? (
      completedVaccinations.map((v, idx) => (
        <CompletedEventCard
          key={v._id || idx}
          name={v.type}
          description={`Vaccinated at: ${v.place ? `${v.place}` : ""}`}
        />
      ))
    ) : (
      <p>No completed vaccinations.</p>
    );

  return (
    <>
      <Header
        title="Health Reports"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={HealthReportsSubNav}
      />
      {loading && <LoadingScreen message="Loading Reminders..." />}
      <main
        className="reminders-main body-main-div"
        style={loading ? { filter: "blur(2px)" } : {}}
      >
        <h2>Reminders</h2>
        {renderReminders()}
        <h2 style={{ marginTop: 40, marginBottom: 40 }}>
          Completed Vaccinations
        </h2>
        {renderCompletedVaccinations()}
      </main>
    </>
  );
}

export default Reminders;
