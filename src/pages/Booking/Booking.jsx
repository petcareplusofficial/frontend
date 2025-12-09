import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/header";
import DatePicker from "../../components/Calendar/DatePicker";
import Popup from "../../components/pop-up/popup";
import APIClient from "../../api/Api";
import "./Booking.css";
import { usePetContext } from "../../hooks/usePetContext";
import LocationIcon from "../../icon/location.svg";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";

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

export function Booking() {
  const { vetId } = useParams();
  const navigate = useNavigate();
  const [vetData, setVetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientType, setPatientType] = useState("returning");
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [color, setColor] = useState("");
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinutes, setSelectedMinutes] = useState("00");
  const [timeFormat, setTimeFormat] = useState("AM");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const { pets, selectedPet } = usePetContext();

  useEffect(() => {
    if (selectedPet && Object.keys(selectedPet).length > 0) {
      setPetType(selectedPet.breedId?.speciesId?.name || "");
      setBreed(selectedPet.breedId?.name || "");
      setAge(selectedPet.age?.toString() || "");
      setColor(selectedPet.sex || "");
    }
  }, [selectedPet]);

  useEffect(() => {
    const fetchVetData = async () => {
      if (!vetId || vetId === "undefined") {
        setError("No veterinarian selected. Please go back and select a vet.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const vetAPI = new APIClient(`/vets/${vetId}`);
        const response = await vetAPI.get();
        let vet = null;
        if (response.data) {
          vet = response.data;
        } else if (response.vet) {
          vet = response.vet;
        } else if (response._id && response.name) {
          vet = response;
        } else {
          throw new Error("Invalid response format");
        }
        if (!vet || !vet.name) {
          throw new Error("Invalid vet data received");
        }
        setVetData(vet);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load veterinarian information";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchVetData();
  }, [vetId]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const formatScheduledDate = () => {
    if (!selectedDate || !selectedHour || !selectedMinutes) {
      return "Please select date and time";
    }
    const options = { weekday: "long", day: "numeric", month: "long" };
    const dateStr = selectedDate.toLocaleDateString("en-US", options);
    const timeStr = `${selectedHour}:${selectedMinutes} ${timeFormat.toLowerCase()}.`;
    return `${dateStr} at ${timeStr}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!petType || !breed || !age || !color) {
      alert("Please fill in all pet details");
      return;
    }
    if (!reason.trim()) {
      alert("Please provide a reason for the appointment");
      return;
    }
    if (!selectedDate) {
      alert("Please select an appointment date");
      return;
    }
    if (!selectedHour || !selectedMinutes) {
      alert("Please select an appointment time");
      return;
    }
    const appointmentDateTime = new Date(selectedDate);
    let hours = parseInt(selectedHour);
    if (timeFormat === "PM" && hours !== 12) hours += 12;
    if (timeFormat === "AM" && hours === 12) hours = 0;
    appointmentDateTime.setHours(hours, parseInt(selectedMinutes), 0);
    let selHour = hours + ":" + selectedMinutes;
    let type = patientType === "first-time";
    const bookingData = {
      petId: selectedPet._id,
      vetId: vetId,
      isNewPatient: type,
      reason,
      date: appointmentDateTime.toISOString(),
      hour: selHour,
      status: "confirmed",
      notes: "no notes.",
    };
    try {
      setSubmitting(true);
      const appointmentAPI = new APIClient("/appointments");
      const response = await appointmentAPI.post(bookingData);
      setBookingDetails({
        vetName: vetData.name,
        dateTime: formatScheduledDate(),
      });
      setShowSuccessPopup(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to book appointment";
      alert(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    navigate("/appointments/current");
  };

  const handleHourChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
      setSelectedHour(value);
    }
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
      setSelectedMinutes(value.padStart(2, "0"));
    }
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
        <LoadingScreen message="Loading veterinarian information..." />
      </>
    );
  }

  if (error || !vetData) {
    return (
      <>
        <Header
          title="Appointments"
          showPetSection={true}
          showSubnavigation={true}
          subNavItems={BodySubNav}
        />
        <main className="booking-main">
          <div className="error-container">
            <p className="error-message">{error || "Veterinarian not found"}</p>
            <button
              onClick={() => navigate("/appointments")}
              className="back-button"
            >
              Back to Appointments
            </button>
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
      <main className="booking-main body-main-div">
        <div className="booking-content">
          <section className="vet-info-section">
            <h2 className="vet-name-title">{vetData.name}</h2>
            <p className="vet-address">
              <img
                src={LocationIcon}
                alt="Location"
                className="location-icon-svg"
              />
              {vetData.location || "Location not specified"}
            </p>
            <p className="vet-description">
              {vetData.description ||
                "Experienced veterinarian dedicated to providing quality care for your pets."}
            </p>
          </section>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="patient-type-section">
              <div
                className={`patient-card ${
                  patientType === "first-time" ? "selected" : ""
                }`}
                onClick={() => setPatientType("first-time")}
              >
                <input
                  type="checkbox"
                  name="patientType"
                  value="first-time"
                  checked={patientType === "first-time"}
                  onChange={() => setPatientType("first-time")}
                  className="patient-checkbox"
                />
                <span className="patient-label-text">First-Time Patient</span>
              </div>
              <div
                className={`patient-card ${
                  patientType === "returning" ? "selected" : ""
                }`}
                onClick={() => setPatientType("returning")}
              >
                <input
                  type="checkbox"
                  name="patientType"
                  value="returning"
                  checked={patientType === "returning"}
                  onChange={() => setPatientType("returning")}
                  className="patient-checkbox"
                />
                <span className="patient-label-text">Returning Patient</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="petType">Pet's type</label>
                <input
                  id="petType"
                  type="text"
                  placeholder="Dog"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="breed">Breed</label>
                <input
                  id="breed"
                  type="text"
                  placeholder="German Shepherd"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="text"
                  placeholder="1 years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="color">Sex</label>
                <input
                  id="color"
                  type="text"
                  placeholder="male"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="reason">Reason For Appointment</label>
              <textarea
                id="reason"
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the reason for your visit..."
                required
              />
            </div>

            <div className="schedule-section">
              <h3>Schedule here</h3>
              <div className="time-date-row">
                <div className="time-input-group">
                  <label>Time Label</label>
                  <div className="time-input-wrapper">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="00"
                      value={selectedHour}
                      onChange={handleHourChange}
                      required
                    />
                    <span className="time-separator">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="00"
                      value={selectedMinutes}
                      onChange={handleMinutesChange}
                      required
                    />
                    <div className="time-format-toggle">
                      <button
                        type="button"
                        className={timeFormat === "AM" ? "active" : ""}
                        onClick={() => setTimeFormat("AM")}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        className={timeFormat === "PM" ? "active" : ""}
                        onClick={() => setTimeFormat("PM")}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  placeholder="dd-mm-yy"
                  disablePast={true}
                  className="date-input-group"
                />
              </div>
              <p className="scheduled-text">
                Scheduled Appointment - {formatScheduledDate()}
              </p>
            </div>
            <button
              type="submit"
              className="confirm-button"
              disabled={submitting}
            >
              {submitting ? "Booking..." : "Confirm here"}
            </button>
          </form>
        </div>
        <Popup
          isOpen={showSuccessPopup}
          onClose={handleSuccessPopupClose}
          type="info"
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "18px",
                margin: "0 0 8px 0",
                color: "#1f2937",
              }}
            >
              You have booked your appointment with {bookingDetails?.vetName}{" "}
              for {bookingDetails?.dateTime}
            </p>
            <p
              style={{
                fontSize: "16px",
                margin: "0 0 30px 0",
                color: "#9A0003",
              }}
            >
              Note: This is only a reminder. You are responsible for Booking and
              managing your own appointments.
            </p>
          </div>
        </Popup>
      </main>
    </>
  );
}

export default Booking;
