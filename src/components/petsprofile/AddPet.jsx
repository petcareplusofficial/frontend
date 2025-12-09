import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PetProfiles.css";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api.js";
import Header from "../Header/header.jsx";
import DatePicker from "../Calendar/DatePicker.jsx";
import { ImageUploadModal, ConfirmationModal } from "../Modal/Modal.jsx";

const petsAPI = new APIClient("/pets");
const getPetImage = (pet) => {
  if (!pet) return null;
  return (
    pet.profileImageURI ||
    pet.profileImage?.url ||
    pet.imageUrl ||
    pet.image ||
    null
  );
};

const PetCard = ({ pet, petImage, onImageClick }) => (
  <div className="pet-card-section">
    <div className="pet-avatar-wrapper">
      <div className="pet-avatar-large">
        {petImage ? (
          <img
            src={petImage}
            alt={pet.name || "New Pet"}
            className="pet-image"
          />
        ) : (
          <span className="pet-avatar-placeholder">No Image</span>
        )}
      </div>
      <button className="edit-pet-avatar-btn" onClick={onImageClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="12"
            cy="13"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </button>
    </div>
    <div className="pet-info-section">
      <h2 className="pet-name">{pet.name || "Enter Pet Name"}</h2>
      <p className="pet-species">{pet.speciesName || "Select Species"}</p>
      <p className="pet-breed">
        <strong>Breed - </strong>
        {pet.breedName || "Select Breed"}
      </p>
    </div>
  </div>
);

const FormField = ({
  label,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  children,
}) => (
  <div className="pet-form-field">
    <label className="pet-field-label">{label}</label>
    {children ? (
      React.cloneElement(children, {
        name,
        value,
        onChange,
        className: "pet-field-input",
      })
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="pet-field-input"
      />
    )}
  </div>
);

const DateFormField = ({
  label,
  name,
  value,
  onChange,
  disableFuture = false,
}) => (
  <div className="pet-form-field">
    <label className="pet-field-label">{label}</label>
    <DatePicker
      value={value ? new Date(value) : null}
      onChange={(date) => {
        const event = {
          target: {
            name,
            value: date ? date.toISOString().split("T")[0] : "",
          },
        };
        onChange(event);
      }}
      placeholder="dd-mm-yyyy"
      disablePast={false}
      disableFuture={disableFuture}
      className="pet-date-picker"
    />
  </div>
);

function AddPet() {
  const navigate = useNavigate();
  const { refreshPets, selectPet } = usePetContext();

  const [species, setSpecies] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [allBreeds, setAllBreeds] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    dob: "",
    age: "",
    sex: "",
    speciesName: "",
    breedName: "",
    image: null,
  });

  const [petImage, setPetImage] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPetId, setCreatedPetId] = useState(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const speciesAPI = new APIClient("/species");
        const fetchedSpecies = await speciesAPI.get();
        setSpecies(fetchedSpecies);

        const extractedBreeds = [];
        fetchedSpecies.forEach((sp) => {
          if (sp.breeds && Array.isArray(sp.breeds)) {
            extractedBreeds.push(...sp.breeds);
          }
        });

        setAllBreeds(extractedBreeds);
      } catch (err) {
        console.error("Failed to fetch species:", err);
      }
    };
    fetchSpecies();
  }, []);

  useEffect(() => {
    if (formData.species && allBreeds.length > 0) {
      const filtered = allBreeds.filter((breed) => {
        const breedSpeciesId = breed.speciesId?._id || breed.speciesId;
        return breedSpeciesId === formData.species;
      });

      setBreeds(filtered);
      setFormData((prev) => ({ ...prev, breed: "", breedName: "" }));
    } else {
      setBreeds([]);
    }
  }, [formData.species, allBreeds]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, image: petImageFile }));
  }, [formData.image]);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString().padStart(2, "0");
  };

  useEffect(() => {
    if (formData.dob) {
      const age = calculateAge(formData.dob);
      setFormData((prev) => ({ ...prev, age }));
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "species") {
      const selectedSpecies = species.find((s) => s._id === value);
      setFormData((prev) => ({
        ...prev,
        species: value,
        speciesName: selectedSpecies?.name || "",
      }));
    } else if (name === "breed") {
      const selectedBreed = breeds.find((b) => b._id === value);
      setFormData((prev) => ({
        ...prev,
        breed: value,
        breedName: selectedBreed?.name || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (file) => {
    setPetImageFile(file);
    setPetImage(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const validateForm = () => {
    if (
      !formData.image ||
      !formData.name ||
      !formData.species ||
      !formData.breed
    ) {
      alert(
        "Please fill in all required fields: Name, Species, Breed, and Image."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const form = new FormData();

      form.append("name", formData.name);
      form.append("breedId", formData.breed);
      form.append(
        "dob",
        formData.dob
          ? new Date(formData.dob).toISOString()
          : new Date().toISOString()
      );
      form.append("age", calculateAge(formData.dob));
      form.append("sex", formData.sex || "male");

      if (petImageFile) {
        form.append("image", petImageFile);
      }

      const createdPet = await petsAPI.post(form);

      setCreatedPetId(createdPet._id);
      selectPet(createdPet._id);

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Create pet error:", err);
      alert("Failed to create pet. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    navigate(`/profile/pet`);
    window.location.reload();
  };

  const handleCancel = () => {
    if (formData.image || formData.name || formData.species || formData.breed) {
      if (confirm("Are you sure? Unsaved data will be lost.")) {
        navigate("/profile/user");
      }
    } else {
      navigate("/profile/user");
    }
  };

  const headerProps = {
    title: "Add New Pet",
    notification: "",
    showPetSection: false,
    showSubnavigation: true,
    subNavItems: [
      {
        icon: "",
        label: "Back to Profile",
        to: "/profile/user",
      },
    ],
    isMobile: false,
    onMenuToggle: () => {},
  };

  return (
    <div className="pet-profile-page">
      <Header {...headerProps} />
      <div className="Main-content-body" style={{ paddingTop: "20px" }}>
        <PetCard
          pet={formData}
          petImage={petImage}
          onImageClick={() => setShowImageModal(true)}
        />

        <div className="basic-detail-section">
          <div className="detail-header">
            <h2 className="detail-title">Pet Details</h2>
          </div>

          {isSubmitting ? (
            <div className="loading-state">
              <p>Creating pet profile...</p>
            </div>
          ) : (
            <div className="detail-form-grid">
              <FormField
                label="Name"
                placeholder="Enter pet name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

              <DateFormField
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                disableFuture={true}
              />

              <FormField
                label="Species *"
                name="species"
                value={formData.species}
                onChange={handleChange}
              >
                <select>
                  <option value="">Select Species (Required)</option>
                  {species.map((sp) => (
                    <option key={sp._id} value={sp._id}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Age"
                placeholder="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                readOnly={true}
              />

              <FormField
                label="Breed *"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
              >
                <select disabled={!formData.species}>
                  <option value="">
                    {formData.species
                      ? "Select Breed (Required)"
                      : "Select Species First"}
                  </option>
                  {breeds.map((breed) => (
                    <option key={breed._id} value={breed._id}>
                      {breed.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              >
                <select>
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </FormField>
            </div>
          )}

          <div className="detail-actions">
            <button className="delete-pet-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="add-update-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Create Pet Profile
            </button>
          </div>
        </div>

        <ImageUploadModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onUpload={handleImageUpload}
          currentImage={petImage}
        />

        <ConfirmationModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Success!"
          message={`${formData.name}'s profile has been created successfully!`}
          onConfirm={handleSuccessConfirm}
          confirmText="View Profile"
        />
      </div>
    </div>
  );
}

export default AddPet;
