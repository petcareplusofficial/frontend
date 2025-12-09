import { useState, useEffect, useRef } from "react";
import { usePetContext } from "../../hooks/usePetContext";
import Header from "../../components/Header/header";
import APIClient from "../../api/Api";
import Popup from "../../components/pop-up/popup";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import "./CurrentAppointments.css";
import ClockIcon from "../../icon/clock.svg";

const BodySubNav = [
  {
    icon: "",
    label: "Book Appointments",
    to: "/appointments",
  },
  {
    icon: "",
    label: "Current Appointments",
    to: "/appointments/current",
  },
];

export default function CurrentAppointments() {
  const { selectedPet } = usePetContext();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedPet?._id) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [selectedPet]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const appointmentsApi = new APIClient(
        `/appointments/pet/${selectedPet._id}`,
      );
      const data = await appointmentsApi.get();

      const enrichedAppointments = await Promise.all(
        data.map(async (appointment) => {
          console.log("Processing appointment:", appointment._id, "Status:", appointment.status, "VetId:", appointment.vetId);
          

          console.log("VetId is already an object or not present");
          return appointment;
        }),
      );

      console.log("Enriched appointments:", enrichedAppointments);

      const cancelled = enrichedAppointments.filter(
        (apt) => apt.status === "cancelled",
      );
      const upcoming = enrichedAppointments.filter(
        (apt) => apt.status !== "cancelled",
      );

      console.log("Cancelled appointments:", cancelled);
      console.log("Upcoming appointments:", upcoming);

      setUpcomingAppointments(upcoming);
      setCancelledAppointments(cancelled);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (appointmentId) => {
    setOpenMenuId(openMenuId === appointmentId ? null : appointmentId);
  };

  const handleCancelClick = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelConfirm(true);
    setOpenMenuId(null);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;

    try {
      const cancelApi = new APIClient(`/appointments/${appointmentToCancel}`);
      await cancelApi.delete();

      setShowCancelConfirm(false);
      await fetchAppointments();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setAppointmentToCancel(null);
    }
  };

  const handleCancelNo = () => {
    setShowCancelConfirm(false);
    setAppointmentToCancel(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(dateString);
    aptDate.setHours(0, 0, 0, 0);

    const diffTime = aptDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 ? diffDays : 0;
  };

  const getDaysUntilText = (dateString) => {
    if (!dateString) return "Date not set";

    const days = getDaysUntil(dateString);

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `in ${days} Days`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCancelledDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return `Cancelled ${date.toISOString().split("T")[0].replace(/-/g, ".")}`;
    } catch (e) {
      return "Cancelled";
    }
  };

  const getVetName = (appointment) => {
    console.log("Appointment data:", appointment);
    console.log("VetId:", appointment.vetId);
    console.log("VetId type:", typeof appointment.vetId);
    
    if (appointment.vetId && typeof appointment.vetId === 'object' && appointment.vetId.name) {
      return appointment.vetId.name;
    }
    if (appointment.vetName) {
      return appointment.vetName;
    }
    return "Vet Name";
  };

  const getLocation = (appointment) => {
    if (appointment.vetId?.location) return appointment.vetId.location;
    if (appointment.location) return appointment.location;
    return null;
  };

  const getDate = (appointment) => {
    return (
      appointment.date ||
      appointment.createdAt ||
      appointment.scheduledDate ||
      null
    );
  };

  if (loading) {
    return (
      <>
        <Header
          title="Appointments"
          showPetSection={true}
          showSubnavigation={true}
          subNavItems={BodySubNav}
        />
        <main className="appointments-main">
          <LoadingScreen />
        </main>
      </>
    );
  }

  if (!selectedPet) {
    return (
      <>
        <Header
          title="Appointments"
          showPetSection={true}
          showSubnavigation={true}
          subNavItems={BodySubNav}
        />
        <main className="appointments-main body-main-div">
          <div className="no-pet-selected">
            <p>Please select a pet to view appointments</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Appointments"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={BodySubNav}
      />
      <main className="appointments-main">
        <div className="appointments-container">
          {error && (
            <div className="error-banner">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                  fill="#DC2626"
                />
              </svg>
              <p>{error}</p>
              <button onClick={fetchAppointments}>Retry</button>
            </div>
          )}

          <section className="appointments-section">
            <h2 className="section-title">Upcoming Appointments</h2>

            {upcomingAppointments.length === 0 ? (
              <div className="no-appointments">
                <div className="empty-calendar">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="calendar-icon-svg"
                  >
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                  </svg>
                  <div className="calendar-date">17</div>
                </div>
                <p className="no-appointments-text">No upcoming appointments</p>
              </div>
            ) : (
              <div className="appointments-list">
                {upcomingAppointments.map((appointment) => {
                  const appointmentDate = getDate(appointment);

                  return (
                    <div
                      key={appointment._id}
                      className="appointment-card upcoming"
                    >
                      {appointmentDate && (
                        <div className="appointment-badge">
                          {getDaysUntilText(appointmentDate)}
                        </div>
                      )}

                      <div className="appointment-content">
                        <div className="appointment-info">
                          <h3 className="vet-name">
                            {getVetName(appointment)}
                          </h3>
                          <p className="appointment-date">
                            {formatDate(appointmentDate)}
                          </p>
                          <p className="consultation-type">
                            {appointment.reason || "General Checkup"}
                          </p>
                          {getLocation(appointment) && (
                            <p className="appointment-location">
                              {getLocation(appointment)}
                            </p>
                          )}
                          {appointment.hour && (
                            <p className="appointment-time">
                              <img
                                src={ClockIcon}
                                alt=""
                                className="appointment-icon"
                              />
                              {appointment.hour}
                            </p>
                          )}
                        </div>

                        <div
                          className="menu-container"
                          ref={openMenuId === appointment._id ? menuRef : null}
                        >
                          <button
                            className="menu-button"
                            onClick={() => toggleMenu(appointment._id)}
                            aria-label="Options"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="5"
                                r="2"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="2"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="19"
                                r="2"
                                fill="currentColor"
                              />
                            </svg>
                          </button>

                          {openMenuId === appointment._id && (
                            <div className="dropdown-menu">
                              <button
                                className="menu-item cancel-item"
                                onClick={() =>
                                  handleCancelClick(appointment._id)
                                }
                              >
                                Cancel Appointment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="appointments-section">
            <h2 className="section-title">Cancelled Appointments</h2>

            {cancelledAppointments.length === 0 ? (
              <div className="no-appointments">
                <p>No cancelled appointments</p>
              </div>
            ) : (
              <div className="appointments-list">
                {cancelledAppointments.map((appointment) => {
                  const appointmentDate = getDate(appointment);

                  return (
                    <div
                      key={appointment._id}
                      className="appointment-card cancelled"
                    >
                      <div className="appointment-content">
                        <div className="appointment-info">
                          <h3 className="vet-name">
                            {getVetName(appointment)}
                          </h3>
                          <p className="appointment-date">
                            {formatDate(appointmentDate)}
                          </p>
                          <p className="consultation-type">
                            {appointment.reason || "Consultation"}
                          </p>
                          <p className="cancelled-date">
                            {formatCancelledDate(
                              appointment.cancelledAt || appointment.updatedAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <Popup
          isOpen={showCancelConfirm}
          onClose={handleCancelNo}
          type="confirm"
          message="Are you sure you want to cancel the appointment?"
          onConfirm={handleConfirmCancel}
          confirmText="Yes"
          cancelText="No"
        />

        <Popup
          isOpen={showSuccessModal}
          onClose={closeSuccessModal}
          type="success"
          message="You have successfully cancelled your appointment"
        />
      </main>
    </>
  );
}