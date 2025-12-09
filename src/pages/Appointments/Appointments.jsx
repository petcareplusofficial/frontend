import { useState, useEffect } from "react";
import Header from "../../components/Header/header";
import { VetCardItem, VetCardMobile } from "../../components/VetCard/VetCard";
import APIClient from "../../api/Api";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import "./Appointments.css";

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

export function Appointments() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      setError(null);
      const vetsApi = new APIClient("/vets");
      const data = await vetsApi.get();
      const vetsList = Array.isArray(data) ? data : data.vets || [];
      setVets(vetsList);
    } catch (err) {
      setError("Failed to load veterinarians. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Appointments"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={BodySubNav}
      />
      {loading && <LoadingScreen message="Loading veterinarians..." />}
      <main
        className="appointments-main body-main-div"
        style={loading ? { filter: "blur(2px)" } : {}}
      >
        <h2 className="vet-section-title">Vets near you</h2>
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchVets} className="retry-button">
              Retry
            </button>
          </div>
        )}
        {!loading && !error && vets.length === 0 && (
          <div className="no-vets-message">
            <p>No veterinarians found in your area.</p>
          </div>
        )}
        {!loading && !error && vets.length > 0 && (
          <div className="vet-cards-container">
            {vets.map((vet) => (
              <div key={vet._id}>
                <VetCardItem vet={vet} />
                <VetCardMobile vet={vet} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Appointments;
