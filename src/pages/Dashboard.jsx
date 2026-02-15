import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const [open, setOpen] = useState(window.innerWidth > 768);
  const sidebarRef = useRef(null);

  const isMobile = () => window.innerWidth <= 768;

  // Close sidebar when clicking outside (ONLY MOBILE)
  useEffect(() => {
    function handleClickOutside(event) {
      if (!isMobile()) return;

      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Auto close when route clicked (ONLY MOBILE)
  const handleMenuClick = () => {
    if (isMobile()) setOpen(false);
  };

  // Restore desktop sidebar when resizing
  useEffect(() => {
    function handleResize() {
      if (!isMobile()) setOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container">

      {/* MOBILE BACKDROP */}
      {isMobile() && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(3px)",
            zIndex: 9
          }}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${open ? "open" : "closed"}`}
        style={{
          position: isMobile() ? "fixed" : "relative",
          zIndex: 10,
          height: "100vh"
        }}
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