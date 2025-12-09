import { createContext, useReducer, useEffect } from "react";
import APIClient from "../../api/Api";

export const PetContext = createContext(null);

function bufferToBase64(arr) {
  if (!arr) return null;
  const byteArray = Array.isArray(arr.data) ? arr.data : arr;
  const uint8Arr = new Uint8Array(byteArray);
  let binary = "";
  for (let i = 0; i < uint8Arr.length; i++) {
    binary += String.fromCharCode(uint8Arr[i]);
  }
  return window.btoa(binary);
}

function getPetImageURI(profileImage) {
  if (profileImage && profileImage.data && profileImage.contentType) {
    const base64 = bufferToBase64(profileImage.data);
    return `data:${profileImage.contentType};base64,${base64}`;
  }
  return "/placeholder.png";
}

const initialState = {
  pets: [],
  selectedPet: null,
  loading: true,
  error: null,
};

function petReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "SET_PETS":
      return {
        ...state,
        pets: action.payload,
        selectedPet: action.payload.length > 0 ? action.payload[0] : null,
        loading: false,
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "SELECT_PET":
      const foundPet = state.pets.find((pet) => pet._id === action.id);
      return {
        ...state,
        selectedPet: foundPet || null,
      };

    default:
      return state;
  }
}

export const PetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(petReducer, initialState);

  // Fetch pets from API with timeout and error handling
  useEffect(() => {
    const fetchPets = async () => {
      dispatch({ type: "SET_LOADING" });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const startTime = performance.now();

        const petsApi = new APIClient("/pets");
        const response = await petsApi.get({ signal: controller.signal });

        const endTime = performance.now();
        console.log(`Pets API took ${Math.round(endTime - startTime)}ms`);

        clearTimeout(timeoutId);

        // Validate response
        if (response && Array.isArray(response)) {
          const processedPets = response.map((pet) => ({
            ...pet,
            profileImageURI: getPetImageURI(pet.profileImage),
          }));
          dispatch({ type: "SET_PETS", payload: processedPets });
        } else {
          throw new Error("Invalid response format from pets API");
        }
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle different error types
        let errorMessage = "Failed to load pets. Please try again.";

        if (error.name === "AbortError") {
          errorMessage = "Request timeout. Please check your connection.";
        } else if (error.response) {
          // Server responded with error
          errorMessage = `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Request made but no response
          errorMessage =
            "No response from server. Please check your connection.";
        }

        console.error("Error fetching pets:", error);
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    };

    fetchPets();
  }, []);

  const selectPet = (id) => dispatch({ type: "SELECT_PET", id });

  return (
    <PetContext.Provider
      value={{
        pets: state.pets,
        selectedPet: state.selectedPet,
        loading: state.loading,
        error: state.error,
        selectPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export default PetProvider;
