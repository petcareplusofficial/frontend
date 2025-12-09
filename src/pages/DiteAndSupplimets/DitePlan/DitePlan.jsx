import React, { useState, useEffect } from "react";
import Header from "../../../components/Header/header";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import APIClient from "../../../api/Api";
import { usePetContext } from "../../../hooks/usePetContext";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";
import Popup from "../../../components/pop-up/popup";
import "./DitePlan.css";

export function DitePlan() {
  const navigate = useNavigate();
  const { selectedPet } = usePetContext();

  const [favoriteFoods, setFavoriteFoods] = useState("");
  const [foodPreferences, setFoodPreferences] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupType, setPopupType] = useState("info");

  const petId = selectedPet?._id;

  useEffect(() => {
    setFavoriteFoods("");
    setFoodPreferences("");
    setNotes("");
  }, [petId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!petId) {
      setPopupMsg("No pet selected. Please select a pet before submitting.");
      setPopupTitle("Pet not selected");
      setPopupType("error");
      setIsPopupOpen(true);
      setSubmitting(false);
      return;
    }

    const dietData = { petId, favoriteFoods, foodPreferences, notes };

    try {
      const dietAPI = new APIClient("/diets");
      await dietAPI.post(dietData);
      navigate("/diteandsupplements/todaysplan");
    } catch (err) {
      setPopupMsg(
        "Failed to save diet plan: " +
          (err.response?.data?.message || err.message)
      );
      setPopupTitle("Error");
      setPopupType("error");
      setIsPopupOpen(true);
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting && (
        <LoadingScreen
          message={`Generating ${
            selectedPet?.name ? selectedPet.name : "pet"
          }'s diet plan...`}
        />
      )}
      <Header
        title="Diet Plan"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={[
          {
            icon: "",
            label: "Diet Plan",
            to: "/diteandsupplements/diteplan",
          },
        ]}
      />
      <main className="diteplan-main body-main-div">
        <form onSubmit={handleSubmit}>
          <h1>
            Generate{" "}
            <span className="PetsNameInDitePlan">
              {selectedPet?.name ? selectedPet.name : "your"}'s
            </span>{" "}
            diet plan{" "}
          </h1>
          <div className="fieldset-legend">
            <Input
              label="Favorite Food"
              type="medium"
              value={favoriteFoods}
              placeholder="e.g. tuna, salmon, chicken"
              onChange={(e) => setFavoriteFoods(e.target.value)}
              required
            />
            <Input
              label="Food Preferences"
              type="medium"
              value={foodPreferences}
              placeholder="e.g. dry food, wet food, tuna"
              onChange={(e) => setFoodPreferences(e.target.value)}
              required
            />
            <Input
              label="Additional Notes"
              type="large"
              value={notes}
              placeholder="Any other relevant information"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="submit-dietplan-btn-div">
            <Button
              className="submit-dietplan-btn"
              label={submitting ? "Generating...." : "Generate Diet Plan"}
              type="large"
              disabled={submitting}
            />
          </div>
        </form>
      </main>
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={popupTitle}
        message={popupMsg}
        type={popupType}
      />
    </>
  );
}

export default DitePlan;
