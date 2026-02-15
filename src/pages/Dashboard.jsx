import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const [open, setOpen] = useState(window.innerWidth > 768);
  const sidebarRef = useRef(null);

  const isMobile = () => window.innerWidth <= 768;

  // Close sidebar on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (!isMobile()) setOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when menu clicked (mobile only)
  const handleMenuClick = () => {
    if (isMobile()) setOpen(false);
  };

  return (
    <div className="dashboard-container">

      {/* OVERLAY — blocks touch + allows closing */}
      {open && isMobile() && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            zIndex: 9
          }}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${open ? "open" : "closed"}`}
        style={{ zIndex: 10 }}
      >
        <h2 className="logo">SwapHub</h2>

        <NavLink to="/dashboard" end className="menu-item" onClick={handleMenuClick}>
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/profile" className="menu-item" onClick={handleMenuClick}>
          Profile
        </NavLink>

        <NavLink to="/dashboard/chat" className="menu-item" onClick={handleMenuClick}>
          Chat
        </NavLink>

        <NavLink to="/dashboard/requests" className="menu-item" onClick={handleMenuClick}>
          Requests
        </NavLink>

        <NavLink to="/dashboard/settings" className="menu-item" onClick={handleMenuClick}>
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