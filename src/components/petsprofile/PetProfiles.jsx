import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PetProfiles.css";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api.js";
import Save from "../../assets/profile/save.svg";
import Header from "../Header/header.jsx";
import DatePicker from "../Calendar/DatePicker.jsx";
import { ImageUploadModal, ConfirmationModal } from "../Modal/Modal.jsx";

const petsAPI = new APIClient("/pets");

const EMPTY_PET_DATA = {
  name: "",
  species: "",
  breed: "",
  dob: "",
  age: "",
  sex: "",
};

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

const PetCard = ({ pet, petImage, isEditable, onImageClick }) => (
  <div className="pet-card-section">
    <div className="pet-avatar-wrapper">
      <div className="pet-avatar-large">
        {petImage ? (
          <img src={petImage} alt={pet.name} className="pet-image" />
        ) : (
          <span className="pet-avatar-placeholder">
            <span>🐾</span>
          </span>
        )}
      </div>
      {isEditable && (
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
      )}
    </div>
    <div className="pet-info-section">
      <h2 className="pet-name">{pet.name || "Pet Name"}</h2>
      <p className="pet-species">{pet.speciesName || "Species"}</p>
      <p className="pet-breed">
        <strong>Breed - </strong>
        {pet.breedName || "Breed"}
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
  readOnly,
  children,
}) => (
  <div className="pet-form-field">
    <label className="pet-field-label">{label}</label>
    {children ? (
      React.cloneElement(children, {
        name: name,
        value: value,
        onChange: onChange,
        disabled: readOnly,
        className: readOnly ? "pet-field-input read-only" : "pet-field-input",
      })
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={readOnly ? "pet-field-input read-only" : "pet-field-input"}
      />
    )}
  </div>
);

const DateFormField = ({ label, name, value, onChange, readOnly }) => (
  <div className="pet-form-field">
    <label className="pet-field-label">{label}</label>
    {readOnly ? (
      <input
        type="text"
        value={value ? new Date(value).toLocaleDateString("en-GB") : ""}
        readOnly
        className="pet-field-input read-only"
      />
    ) : (
      <DatePicker
        value={value ? new Date(value) : null}
        onChange={(date) => {
          const event = {
            target: {
              name: name,
              value: date ? date.toISOString().split("T")[0] : "",
            },
          };
          onChange(event);
        }}
        placeholder="dd-mm-yyyy"
        disablePast={false}
        disableFuture={true}
        className="pet-date-picker"
      />
    )}
  </div>
);

const BasicDetailForm = ({
  formData,
  handleChange,
  isEditable,
  toggleEdit,
  handleDelete,
  handleUpdate,
  isLoading,
  species,
  breeds,
}) => (
  <div className="basic-detail-section">
    <div className="detail-header">
      <h2 className="detail-title">Pet Details</h2>
      <button
        className="detail-edit-btn"
        onClick={toggleEdit}
        disabled={isLoading}
        title={isEditable ? "Save changes" : "Edit details"}
      >
        {isEditable ? (
          <span style={{ fontSize: "20px" }}>Edit</span>
        ) : (
          <img src={Save} alt="Save" className="edit-save-icon" />
        )}
      </button>
    </div>
    {isLoading ? (
      <div className="loading-state">
        <p>Loading...</p>
      </div>
    ) : (
      <div className="detail-form-grid">
        <FormField
          label="Name"
          placeholder="Enter pet name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          readOnly={!isEditable}
        />
        <DateFormField
          label="Date of Birth"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          readOnly={!isEditable}
        />
        <FormField
          label="Species"
          name="species"
          value={formData.species}
          onChange={handleChange}
          readOnly={!isEditable}
        >
          <select>
            <option value="">Select Species</option>
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
          label="Breed"
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          readOnly={!isEditable}
        >
          <select disabled={!formData.species && isEditable}>
            <option value="">
              {formData.species ? "Select Breed" : "Select Species First"}
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
          readOnly={!isEditable}
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
      <button className="delete-pet-btn" onClick={handleDelete}>
        Delete
      </button>
      <button
        className="add-update-btn"
        onClick={handleUpdate}
        disabled={!isEditable}
      >
        Update
      </button>
    </div>
  </div>
);

function PetProfile() {
  const navigate = useNavigate();
  const { selectedPet, loading, error, refreshPets, selectPet, pets } =
    usePetContext();
  const [formData, setFormData] = useState(EMPTY_PET_DATA);
  const [originalData, setOriginalData] = useState(EMPTY_PET_DATA);
  const [isEditable, setIsEditable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [petImage, setPetImage] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [species, setSpecies] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [allBreeds, setAllBreeds] = useState([]);

  useEffect(() => {
    const fetchSpecies = async () => {
      const speciesAPI = new APIClient("/species");
      const fetchedSpecies = await speciesAPI.get();
      setSpecies(fetchedSpecies);
      const extractedBreeds = [];
      fetchedSpecies.forEach((species) => {
        if (species.breeds && Array.isArray(species.breeds)) {
          extractedBreeds.push(...species.breeds);
        }
      });
      setAllBreeds(extractedBreeds);
    };
    fetchSpecies();
  }, []);

  useEffect(() => {
    const selectedPetId = localStorage.getItem("selectedPetId");
    if (selectedPetId && pets.length > 0) {
      selectPet(selectedPetId);
      localStorage.removeItem("selectedPetId");
    }
  }, [pets, selectPet]);

  useEffect(() => {
    if (formData.species && allBreeds.length > 0) {
      const filteredBreeds = allBreeds.filter((breed) => {
        const breedSpeciesId = breed.speciesId?._id || breed.speciesId;
        return breedSpeciesId === formData.species;
      });
      setBreeds(filteredBreeds);
    } else if (allBreeds.length > 0) {
      setBreeds(allBreeds);
    }
  }, [formData.species, allBreeds]);

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
    if (selectedPet && species.length > 0) {
      const speciesId = selectedPet.species?._id || selectedPet.species;
      const speciesName =
        selectedPet.species?.name ||
        species.find((s) => s._id === speciesId)?.name ||
        "";
      const breedId =
        selectedPet.breed?._id || selectedPet.breedId?._id || selectedPet.breed;
      const breedName =
        selectedPet.breed?.name ||
        selectedPet.breedId?.name ||
        allBreeds.find((b) => b._id === breedId)?.name ||
        "";
      const petData = {
        name: selectedPet.name || "",
        species: speciesId || "",
        speciesName: speciesName,
        breed: breedId || "",
        breedName: breedName,
        dob: selectedPet.dob
          ? new Date(selectedPet.dob).toISOString().split("T")[0]
          : "",
        age: calculateAge(selectedPet.dob),
        sex: selectedPet.sex || "",
        image: selectedPet.imageUrl || "",
      };
      setFormData(petData);
      setOriginalData(petData);
      setPetImage(getPetImage(selectedPet));
    }
  }, [selectedPet, species, allBreeds]);

  useEffect(() => {
    if (formData.dob) {
      const calculatedAge = calculateAge(formData.dob);
      setFormData((prev) => ({ ...prev, age: calculatedAge }));
    }
  }, [formData.dob]);

  useEffect(() => {
    if (!selectedPet) {
      const selectedPetId = localStorage.getItem("selectedPetId");
      if (selectedPetId) {
        const fetchPetProfileDirectly = async () => {
          try {
            const petAPI = new APIClient(`/pets/${selectedPetId}`);
            const petData = await petAPI.get();
            setFormData({
              name: petData.name || "",
              species: petData.species?._id || petData.species || "",
              speciesName: petData.species?.name || "",
              breed: petData.breed?._id || petData.breed || "",
              breedName: petData.breed?.name || "",
              dob: petData.dob
                ? new Date(petData.dob).toISOString().split("T")[0]
                : "",
              age: calculateAge(petData.dob),
              sex: petData.sex || "",
            });
            setOriginalData(formData);
            setPetImage(getPetImage(petData));
          } catch {}
        };
        fetchPetProfileDirectly();
        localStorage.removeItem("selectedPetId");
      }
    }
  }, [selectedPet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "species") {
      const selectedSpecies = species.find((s) => s._id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        speciesName: selectedSpecies?.name || "",
        breed: "",
        breedName: "",
      }));
    } else if (name === "breed") {
      const selectedBreed = breeds.find((b) => b._id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        breedName: selectedBreed?.name || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (file) => {
    setPetImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPetImage(imageUrl);
  };

  const handleUpdate = async () => {
    if (!selectedPet || !selectedPet._id) {
      alert("No pet selected to update");
      return;
    }
    if (!isEditable) {
      alert("Please enable edit mode first");
      return;
    }
    setIsSubmitting(true);
    try {
      const calculateAgeNumber = (dob) => {
        if (!dob) return 0;
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
        return age;
      };
      const updateData = {
        name: formData.name,
        breedId: formData.breed,
        dob: formData.dob
          ? new Date(formData.dob).toISOString()
          : new Date().toISOString(),
        age: calculateAgeNumber(formData.dob) || 0,
        sex: formData.sex || "male",
      };
      const updateAPI = new APIClient(`/pets/${selectedPet._id}`);
      const updatedPet = await updateAPI.put(updateData);
      if (petImageFile) {
        try {
          const formDataImage = new FormData();
          formDataImage.append("profileImage", petImageFile);
          const imageAPI = new APIClient(
            `/pets/${selectedPet._id}/upload-image`
          );
          const imageResponse = await imageAPI.post(formDataImage);
          if (imageResponse.profileImage?.url) {
            setPetImage(imageResponse.profileImage.url);
          }
        } catch {
          alert(
            "Pet details updated but image upload failed. Please try uploading the image again."
          );
        }
        setPetImageFile(null);
      }
      setOriginalData({ ...formData });
      setIsEditable(false);
      if (selectPet && typeof selectPet === "function") {
        setTimeout(() => {
          selectPet(selectedPet._id);
        }, 100);
      }
      alert("Pet profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error";
      alert(`Failed to update pet: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPet || !selectedPet._id) {
      alert("No pet selected to delete");
      return;
    }
    try {
      const deleteAPI = new APIClient(`/pets/${selectedPet._id}`);
      await deleteAPI.delete();
      setShowDeleteModal(false);
      if (refreshPets && typeof refreshPets === "function") {
        await refreshPets();
      }
      if (pets.length > 1) {
        const remainingPets = pets.filter((p) => p._id !== selectedPet._id);
        selectPet(remainingPets[0]._id);
      } else {
        navigate("/profile/pet/new");
      }
      alert(`${selectedPet.name}'s profile has been deleted successfully.`);
    } catch (err) {
      alert(`Failed to delete pet: ${err.message || "Unknown error"}`);
    }
  };

  const toggleEdit = () => {
    if (isEditable) {
      setFormData(originalData);
      setPetImage(getPetImage(selectedPet));
      setIsEditable(false);
    } else {
      setIsEditable(true);
    }
  };

  const headerProps = {
    title: "Pet Profile",
    showPetSection: true,
    showSubnavigation: true,
    subNavItems: [
      {
        icon: "",
        label: "Add New Pet",
        to: "/profile/pet/new",
      },
    ],
    isMobile: false,
    onMenuToggle: () => {},
  };

  if (loading) {
    return (
      <div className="pet-profile-page">
        <Header {...headerProps} />
        <div className="loading-state">
          <p>Fetching pet profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pet-profile-page">
        <Header {...headerProps} />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate("/profile/user")}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPet) {
    return (
      <div className="pet-profile-page">
        <Header {...headerProps} />
        <div className="error-container">
          <p>No pet profile selected.</p>
          <button onClick={() => navigate("/profile/pet/new")}>
            Add New Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-profile-page">
      <Header {...headerProps} />
      <div className="Main-content-body" style={{ paddingTop: "20px" }}>
        <PetCard
          pet={formData}
          petImage={petImage}
          isEditable={isEditable}
          onImageClick={() => setShowImageModal(true)}
        />
        <BasicDetailForm
          formData={formData}
          handleChange={handleChange}
          isEditable={isEditable}
          toggleEdit={toggleEdit}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isLoading={isSubmitting}
          species={species}
          breeds={breeds}
        />
        <ImageUploadModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onUpload={handleImageUpload}
          currentImage={petImage}
        />
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Pet Profile"
          message={`Are you sure you want to delete ${formData.name}'s profile? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}

export default PetProfile;
