import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../styles/dashboard.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard() {
  const [open, setOpen] = useState(window.innerWidth > 768);
  const sidebarRef = useRef(null);

  // Detect mobile
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

  // Handle resize → restore desktop sidebar
  useEffect(() => {
    function handleResize() {
      if (!isMobile()) setOpen(true);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${open ? "open" : "closed"}`}
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
          Community
        </NavLink>

        <NavLink to="/dashboard/settings" className="menu-item" onClick={handleMenuClick}>
          Settings
        </NavLink>

        <NavLink to="/dashboard/swaps" className="menu-item" onClick={handleMenuClick}>
          Swaps
        </NavLink>
<div className="bottom-menu">
         <NavLink to="/dashboard/feedback" className="feedback" onClick={handleMenuClick}>
          Feedback
        </NavLink>

<NavLink
  className="logout"
  onClick={async () => {
    await signOut(auth);
    handleMenuClick();
    window.location.href = "/login";
  }}
>
  Logout
</NavLink>
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