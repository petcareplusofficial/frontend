// context/Vetdetails/VetDetails.jsx
import { createContext, useContext, useState, useEffect } from "react";
import APIClient from "../../api/Api";

const VetContext = createContext();


export function useVetDetails() {
  const context = useContext(VetContext);
  if (!context) {
    throw new Error("useVetDetails must be used within VetProvider");
  }
  return context;
}

export function VetProvider({ children }) {
  const [vetDetails, setVetDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const USE_DUMMY_DATA_ONLY = false;

  useEffect(() => {
    fetchVetDetails();
  }, []);

  const fetchVetDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingDummyData(false);

      if (USE_DUMMY_DATA_ONLY) {
        console.log("Using dummy data (API calls disabled)");
        setVetDetails(DUMMY_VET_DATA);
        setUsingDummyData(true);
        setLoading(false);
        return;
      }
      
      const vetAPI = new APIClient("/vets");
      const response = await vetAPI.get();
      
      console.log("Vet API Response:", response);
      
      const vets = response.data || response.vets || response;
      setVetDetails(Array.isArray(vets) ? vets : []);
      
    } catch (err) {

      if (!vetDetails.length) {
        console.log("Backend not connected - using demo data");
      }
      
      const errorMessage = err.response?.data?.message || err.message || "Network Error";
      setError(errorMessage);
      

      setVetDetails(DUMMY_VET_DATA);
      setUsingDummyData(true);
      
    } finally {
      setLoading(false);
    }
  };

  const value = {
    vetDetails,
    loading,
    error,
    usingDummyData,
    refreshVets: fetchVetDetails
  };

  return (
    <VetContext.Provider value={value}>
      {children}
    </VetContext.Provider>
  );
}

export default VetContext;