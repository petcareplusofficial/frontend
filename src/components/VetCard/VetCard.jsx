import { useNavigate } from "react-router-dom";
import "./VetCard.css";

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="star-rating">
      <span className="rating-number">{rating}</span>
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star filled">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">☆</span>
        ))}
      </div>
    </div>
  );
}

function VetAvatar({ name }) {
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="vet-avatar">
      <div className="vet-avatar-initials">
        {getInitials(name)}
      </div>
    </div>
  );
}


export function VetCardItem({ vet }) {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/appointments/booking/${vet._id}`);
  };

  return (
    <div className="vet-card">
      <div className="vet-card-header">
        <div className="vet-info-left">
          <h3 className="vet-name">{vet.name}</h3>
          <p className="vet-location">{vet.location}</p>
        </div>
      </div>

      <p className="vet-description">
        {vet.description || "Experienced veterinarian with a passion for animal welfare."}
      </p>

      <div className="vet-card-footer">
        <StarRating rating={vet.rate || 4} />
        <button className="book-now-btn" onClick={handleBookNow}>
          Book Now
        </button>
      </div>
    </div>
  );
}


export function VetCardMobile({ vet }) {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/appointments/booking/${vet._id}`);
  };

  return (
    <div className="vet-card-mobile">
      <VetAvatar name={vet.name} />
      
      <div className="vet-card-mobile-content">
        <h3 className="vet-name-mobile">{vet.name}</h3>
        <p className="vet-location-mobile">{vet.location}</p>
        <div className="vet-rating-mobile">
          <span className="rating-number-mobile">{vet.rate || 4}</span>
        </div>
      </div>

      <button className="book-now-btn-mobile" onClick={handleBookNow}>
        Book Now
      </button>
    </div>
  );
}

export default VetCardItem;