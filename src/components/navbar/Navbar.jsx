import React, { useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import UserProfile from "../petsprofile/UserProfile";
import Logo from "../../assets/petcare-logo.svg";
import DashboardIcon from "../../assets/navbar/Dashboard.svg";
import HealthRecordsIcon from "../../assets/navbar/Health-Records.svg";
import ReportsIcon from "../../assets/navbar/Reports.svg";
import ExpandIcon from "../../assets/navbar/Navigation-Bar-Expand.svg";
import CollapseIcon from "../../assets/navbar/Navigation-Bar-collapse.svg";
import Avatar from "../../assets/navbar/Avatar.svg";
import AppointmentsIcon from "../../assets/navbar/Appointments.svg";
import DietSupplementsIcon from "../../assets/navbar/Diet-Suppliments.svg";
import PetSwitcher from "../petsprofile/petSwitcher";
import DashboardNavItem from "../../components/Dashboard/DashboardNavItem";
import { handleLogout } from "../Sidebar";

const AppLogo = () => (
  <div className="app-logo-container">
    <img
      src={Logo}
      alt="PetCare+ Logo"
      className="app-logo-svg"
      style={{ width: "190px", height: "160px" }}
    />
  </div>
);

export default function Navbar({ isMobile, isOpen, onClose }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const navClassName = `navbar ${isCollapsed ? "collapsed" : ""} ${
    isMobile && isOpen ? "open-mobile" : ""
  }`;

  return (
    <nav className={navClassName}>
      <div className="logo-section">
        <AppLogo />

        {isMobile && (
          <span
            className="header-icon-box mobile-close-toggle"
            onClick={onClose}
          >
            &times;
          </span>
        )}

        {!isMobile && (
          <span
            className="header-icon-box sidebar-toggle"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <img
                src={ExpandIcon}
                alt="Expand Sidebar"
                className="toggle-icon"
              />
            ) : (
              <img
                src={CollapseIcon}
                alt="Collapse Sidebar"
                className="toggle-icon"
              />
            )}
          </span>
        )}
      </div>

      {isMobile && (
        <div className="navbar-mobile-pet-switcher-wrapper">
          <PetSwitcher onClose={onClose} />
        </div>
      )}

      {!isCollapsed && <h4 className="nav-heading main-heading">MAIN</h4>}

      <div className="nav-group">
        <DashboardNavItem
          SvgIcon={DashboardIcon}
          label="Dashboard"
          to="/dashboard"
          onClose={onClose}
        />
        <DashboardNavItem
          SvgIcon={HealthRecordsIcon}
          label="Pet Health"
          to="/healthreports/healthrecords"
          onClose={onClose}
        />
        <DashboardNavItem
          SvgIcon={ReportsIcon}
          label="Reports"
          to="/reports"
          onClose={onClose}
        />
        <DashboardNavItem
          SvgIcon={AppointmentsIcon}
          label="Appointments"
          to="/appointments"
          onClose={onClose}
        />
        <DashboardNavItem
          SvgIcon={DietSupplementsIcon}
          label="Diet and Supplements"
          to="/diteandsupplements"
          onClose={onClose}
        />
      </div>

      <div className="nav-group profile-group">
        <div className="profile-dropdown-container">
          <NavLink to="/profile" className="profile-display" onClick={onClose}>
            <img
              src={Avatar}
              alt="Avatar"
              className="avatar-placeholder"
              style={{ width: 26, height: 26 }}
            />

            <span className="profile-text">Profile</span>

            <span
              className="profile-options-icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown();
              }}
            >
              &#8285;
            </span>
          </NavLink>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <DashboardNavItem
                label="PetProfile"
                to="/PetProfiles"
                onClick={toggleDropdown}
                onClose={onClose}
              />
              <DashboardNavItem
                label="Logout"
                to="/logout"
                onClick={handleLogout}
                onClose={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
