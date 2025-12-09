import { useState, useRef, useEffect } from "react";
import { usePetContext } from "../../hooks/usePetContext";
import "./petSwitcher.css";

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

const SkeletonLoader = () => (
  <div className="pet-switcher-skeleton">
    <div className="skeleton-avatar"></div>
    <div className="skeleton-info">
      <div className="skeleton-name"></div>
    </div>
  </div>
);

const PetAvatar = ({ pet, size = "default" }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getPetImage(pet);

  if (!imageUrl || imageError) {
    return (
      <div className="pet-avatar-placeholder">
        <span>🐾</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={pet?.name || "Pet"}
      onError={() => setImageError(true)}
    />
  );
};

export default function PetSwitcher() {
  const { pets, selectedPet, selectPet, loading, error } = usePetContext();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading && (!pets || pets.length === 0)) {
    return <SkeletonLoader />;
  }

  if (error && (!pets || pets.length === 0)) {
    return (
      <div className="pet-switcher-error">
        <p>Failed to load pets</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="pet-switcher-empty">
        <p>No pets found</p>
      </div>
    );
  }

  const handlePetSelect = (petId) => {
    selectPet(petId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="pet-switcher-wrapper" ref={wrapperRef}>
      <div className="pet-switcher-display" onClick={toggleDropdown}>
        <div className="pet-info">
          <div className="pet-name-wrapper">
            <span className="pet-name">
              {selectedPet?.name || "Select Pet"}
            </span>
            <div className={`dropdown-arrow ${isOpen ? "open" : ""}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 10L12 15L17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="pet-avatar">
          <PetAvatar pet={selectedPet} />
        </div>
      </div>

      {isOpen && (
        <div className="pet-dropdown-menu open">
          {pets.map((pet) => (
            <div
              key={pet._id}
              className={`pet-dropdown-item ${
                pet._id === selectedPet?._id ? "active" : ""
              }`}
              onClick={() => handlePetSelect(pet._id)}
            >
              <div className="pet-dropdown-avatar">
                <PetAvatar pet={pet} size="small" />
              </div>
              <span className="pet-dropdown-name">{pet.name}</span>
              {pet._id === selectedPet?._id && (
                <svg
                  className="checkmark"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
