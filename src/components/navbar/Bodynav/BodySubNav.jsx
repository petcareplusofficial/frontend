import { Link, useLocation } from "react-router-dom";
import "./BodySubNav.css";

export function BodySubNav({ icon, label, to }) {
    const location = useLocation();


    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`body-nav-item${isActive ? " active" : ""}`}
            tabIndex={0}
        >
            <span className="body-nav-icon">{icon}</span>
            <span className="body-nav-label">{label}</span>
        </Link>
    );
}

export default BodySubNav;