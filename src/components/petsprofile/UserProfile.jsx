import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import location from "../../assets/profile/location_on.svg";
import Phone from "../../assets/profile/Phone.svg";
import email from "../../assets/profile/email.svg";
import Save from "../../assets/profile/save.svg";
import APIClient from "../../api/Api.js";
import Header from "../Header/header.jsx";
import DatePicker from "../Calendar/DatePicker.jsx";

const userAPI = new APIClient("/users");

const initialFormData = {
  name: "",
  password: "",
  email: "",
  location: "",
};

// ---------------------- Supporting Components ----------------------

// 🚀 NEW: Confirmation Modal Component
const ConfirmationModal = ({ onClose }) => (
  <div className="modal-backdrop">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Confirmation</h2>
        <button onClick={onClose} className="modal-close-btn">
          &times;
        </button>
      </div>
      <div className="modal-body">
        <p>Your Profile is successfully updated.</p>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="modal-done-btn">
          Done
        </button>
      </div>
    </div>
  </div>
);

const UserCard = ({ user, profileImage, isEditable, onImageClick }) => (
  // ... (UserCard component is unchanged)
  <div className="user-profile-card">
       {" "}
    <div className="user-avatar-wrapper">
           {" "}
      <div className="user-avatar-large">
               {" "}
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="avatar-image" />
        ) : (
          <span className="avatar-placeholder-large">👤</span>
        )}
             {" "}
      </div>
           {" "}
      {isEditable && (
        <>
                   {" "}
          <button className="edit-avatar-btn" onClick={onImageClick}>
                        <span>✏️</span>         {" "}
          </button>
                    <p className="upload-text">Upload Image</p>       {" "}
        </>
      )}
         {" "}
    </div>
       {" "}
    <div className="user-details">
            <h2 className="user-name">        {user.name || "name"}      </h2> 
         {" "}
      <div className="user-info-item">
               {" "}
        <img src={location} alt="Location Icon" className="info-icon-inline" /> 
              <span>{user.location || "Location"}</span>     {" "}
      </div>
           {" "}
      <div className="user-info-item">
               {" "}
        <img src={Phone} alt="Phone Icon" className="info-icon-inline" />       {" "}
        <span>{user.phone || "Phone Number"}</span>     {" "}
      </div>
           {" "}
      <div className="user-info-item">
               {" "}
        <img src={email} alt="Email Icon" className="info-icon-inline" />       {" "}
        <span>{user.email || "Email"}</span>     {" "}
      </div>
         {" "}
    </div>
     {" "}
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
}) => (
  // ... (FormField component is unchanged)
  <div className="form-field-wrapper">
        <label className="field-label">{label}</label>   {" "}
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={readOnly ? "field-input read-only" : "field-input"}
    />
     {" "}
  </div>
);

const MainInformationForm = ({
  // ... (MainInformationForm component is unchanged)
  formData,
  handleChange,
  isEditable,
  toggleEdit,
  handleSubmit,
  isLoading,
}) => (
  <div className="main-information-section">
       {" "}
    <div className="section-header">
            <h2 className="section-title">Main Information</h2>     {" "}
      <button className="edit-btn" onClick={toggleEdit} disabled={isLoading}>
               {" "}
        {isEditable ? (
          <img src={Save} alt="Save" className="edit-save-icon" />
        ) : (
          <img src={Save} alt="Edit" className="edit-save-icon" />
        )}
             {" "}
      </button>
         {" "}
    </div>
       {" "}
    {isLoading ? (
      <div className="loading-state">
                <p>Loading...</p>     {" "}
      </div>
    ) : (
      <div className="form-fields-grid">
               {" "}
        <FormField
          label="Name"
          placeholder="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          readOnly={!isEditable}
        />
               {" "}
        <FormField
          label="Password"
          placeholder="+1 1234567809"
          name="password"
          value={formData.password}
          onChange={handleChange}
          readOnly={!isEditable}
        />
               {" "}
        <FormField
          label="E-Mail"
          placeholder="Steven12@langara.mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          readOnly={!isEditable}
        />
               {" "}
        <FormField
          label="Location"
          placeholder="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          readOnly={!isEditable}
        />
             {" "}
      </div>
    )}
       {" "}
    {isEditable && !isLoading && (
      <div className="form-actions">
               {" "}
        <button className="cancel-btn" onClick={() => toggleEdit(false)}>
                    Cancel        {" "}
        </button>
               {" "}
        <button className="update-btn" onClick={handleSubmit}>
                    Update        {" "}
        </button>
             {" "}
      </div>
    )}
     {" "}
  </div>
);

// ---------------------- API Helpers ----------------------
async function getUserProfile() {
  return userAPI.get({ endpoint: "/me" });
}

async function updateUserProfile(updatedData) {
  return userAPI.put(updatedData, { endpoint: "/me" });
}

// ---------------------- Main Page Component ----------------------
function UserProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [originalData, setOriginalData] = useState(initialFormData);
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  // 🚀 NEW: State to control the modal visibility
  const [showModal, setShowModal] = useState(false);

  // ... (useEffect for Data Fetching is unchanged)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();

        const profileData = {
          name: data.name || "",
          password: data.password || "",
          email: data.email || "",
          location: data.location || "",
        };

        setFormData(profileData);
        setOriginalData(profileData);
        setProfileImage(data.profileImage?.url || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(
          `Failed to load profile data: ${err.message || "Check connection."}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ... (handleChange and handleImageClick are unchanged)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
        alert("Profile picture uploaded successfully!");
      }
    };
    input.click();
  }; // ---------------------- Data Submission (PUT/PATCH) ----------------------

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        password: formData.password,
        email: formData.email,
        location: formData.location,
      };

      const updatedData = await updateUserProfile(updateData);

      const profileData = {
        name: updatedData.name || "",
        password: updatedData.password || "",
        email: updatedData.email || "",
        location: updatedData.location || "",
      };

      setFormData(profileData);
      setOriginalData(profileData);
      setIsEditable(false);
      setError(null); // 🚀 MODIFIED: Show the modal instead of alert

      setShowModal(true);
      // alert('Profile updated successfully!'); // Removed alert
    } catch (err) {
      console.error("Error submitting profile data:", err);
      alert(
        `Failed to save profile data: ${
          err.message || "Unknown error"
        }. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  }; // ---------------------- Edit/Toggle Logic ----------------------

  const toggleEdit = (shouldSave = false) => {
    if (isEditable && !shouldSave) {
      setFormData(originalData);
      setIsEditable(false);
    } else if (isEditable && shouldSave) {
      handleSubmit();
    } else {
      setIsEditable(true);
    }
  }; // ---------------------- Header Configuration ----------------------

  const headerProps = {
    title: "User Profile",
    showPetSection: true,
    showSubnavigation: true,
    subNavItems: [
      {
        icon: "🐾",
        label: "View Pets",
        to: "/profile/pet",
      },
    ],
    isMobile: false,
    onMenuToggle: () => {
      console.log("Menu toggle clicked");
    },
  }; // ---------------------- Render ----------------------
  if (error && !formData.email) {
    // ... (Error component is unchanged)
    return (
      <div className="profile-page-wrapper">
               {" "}
        <div className="error-container">
                    <p>❌ {error}</p>         {" "}
          <button onClick={() => window.location.reload()}>Retry</button>       {" "}
        </div>
             {" "}
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* 🚀 Render the modal conditionally */}
      {showModal && <ConfirmationModal onClose={() => setShowModal(false)} />}
      <Header {...headerProps} />
      <div className="body-wrapper">
        <UserCard
          user={formData}
          profileImage={profileImage}
          isEditable={isEditable}
          onImageClick={handleImageClick}
        />
        <MainInformationForm
          formData={formData}
          handleChange={handleChange}
          isEditable={isEditable}
          toggleEdit={toggleEdit}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default UserProfile;
