import { Link, useNavigate } from "react-router-dom";
import "./index.css";

export default function AdminNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="admin-navbar">
      <div className="admin-logo">
        Sport<span>Book</span> <small className="badge">Mega Admin</small>
      </div>

      <div className="admin-nav-links">
        <Link to="/admin" className="nav-item active">Dashboard</Link>
      </div>

      <div className="admin-actions">
        <button 
          className="add-booking-btn" 
          onClick={() => navigate("/admin/add-booking")}
        >
          ➕ New Booking
        </button>
      </div>
    </nav>
  );
}