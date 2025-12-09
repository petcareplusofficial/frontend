import React from "react";
import "./LoadingScreen.css";
import paw1 from "../../assets/AnimationImages/animation-for-meals.png";
import paw2 from "../../assets/AnimationImages/animation-for-meals-2.png";
import paw3 from "../../assets/AnimationImages/animation-for-meals-3.png";
import paw4 from "../../assets/AnimationImages/animation-for-meals-4.png";
import paw5 from "../../assets/AnimationImages/animation-for-meals-5.png";

const FRAMES = [paw1, paw2, paw3, paw4, paw5];

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="custom-loading-modal">
      <div className="frame-animation">
        {FRAMES.map((src, idx) => (
          <img
            key={idx}
            src={src}
            className={`loading-frame frame-${idx + 1}`}
            alt={`Loading frame ${idx + 1}`}
          />
        ))}
      </div>
      <p className="custom-loading-text">{message}</p>
    </div>
  );
}
