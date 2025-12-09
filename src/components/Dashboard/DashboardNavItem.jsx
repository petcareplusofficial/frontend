import { Link, useLocation } from "react-router-dom";
import "./DashboardNavItem.css";

function DashboardNavItem({ SvgIcon, label, to, onClick, onClose }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Link
      to={to}
      className={`dashboard-nav-item${isActive ? " active" : ""}`}
      tabIndex={0}
      onClick={handleClick}
    >
           {" "}
      <span className="dashboard-icon">
                 {" "}
        {typeof SvgIcon === "string" ? (
          <img src={SvgIcon} alt={`${label} icon`} className="nav-icon-svg" />
        ) : (
          SvgIcon && <SvgIcon className="nav-icon-svg" />
        )}
             {" "}
      </span>
            <span className="dashboard-label">{label}</span>   {" "}
    </Link>
  );
}

export default DashboardNavItem;
