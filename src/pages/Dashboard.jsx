import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/dashboard.css";

function Dashboard() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : "closed"}`}>
        <h2 className="logo">SwapHub</h2>

        <NavLink to="/dashboard" className="menu-item">
          Dashboard
        </NavLink>

        <NavLink to="profile" className="menu-item">
          Profile
        </NavLink>

        <NavLink to="chat" className="menu-item">
          Chat
        </NavLink>

        <NavLink to="requests" className="menu-item">
          Requests
        </NavLink>

        <div className="menu-item logout" onClick={handleLogout}>
          Logout
        </div>
      </div>

      {/* Main Area */}
      <div className="main-content">
        <div className="topbar">
          <button className="hamburger" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;