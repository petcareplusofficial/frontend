import React from "react";
import PetSwitcher from "../petsprofile/petSwitcher";
import BodySubNav from "../navbar/Bodynav/BodySubNav";
import { useLocation } from "react-router-dom";
import { useMobile } from "../../Context/MobileContext/MobileContext";

function Header({
  title,
  notification,
  showPetSection = false,
  showSubnavigation = false,
  subNavItems = [],
}) {
  const location = useLocation();
  const { isMobile, isMobileMenuOpen, handleMenuToggle, handleMenuClose } =
    useMobile();

  const pageTitle = title || location.pathname.split("/").filter(Boolean).pop() || "Dashboard";

  return (
    <header className="header">
      <div className="header-main">
        {isMobile && (
          <button className="menu-toggle" onClick={handleMenuToggle}>
            ☰
          </button>
        )}
        <div className="header-top">
          <h1>{pageTitle}</h1>
        </div>
        <div id="show-pet-section">
          {showPetSection && (
            <div className="header-pet-section">
              <div className="header-notification">
                {notification && <p>{notification}</p>}
              </div>
              <div className="container">
                <PetSwitcher />
              </div>
            </div>
          )}
        </div>
      </div>
      <div id="show-subnavigation-section">
        {showSubnavigation && (
          <nav className="header-subnavigation">
            {subNavItems.map((element, index) => (
              <BodySubNav
                key={index}
                icon={element.icon}
                label={element.label}
                to={element.to}
              />
            ))}
          </nav>
        )}
      </div>
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={handleMenuClose} />
      )}
    </header>
  );
}

export default Header;