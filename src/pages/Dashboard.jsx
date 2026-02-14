import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const [open, setOpen] = useState(true);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${open ? "open" : "closed"}`}
      >
        <h2 className="logo">SwapHub</h2>

        <NavLink to="/dashboard" end className="menu-item">
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/profile" className="menu-item">
          Profile
        </NavLink>

        <NavLink to="/dashboard/chat" className="menu-item">
          Chat
        </NavLink>

        <NavLink to="/dashboard/requests" className="menu-item">
          Requests
        </NavLink>

	<NavLink to="/dashboard/settings" className="menu-item">
    Settings
  </NavLink>

        <div className="menu-item logout">
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