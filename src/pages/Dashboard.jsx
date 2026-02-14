import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/dashboard.css";

function Dashboard() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">

      {/* Top Bar */}
      <div className="topbar">
        <div className="menu-icon" onClick={() => setOpen(true)}>
          ☰
        </div>
        <h2>SwapHub</h2>
      </div>

      {/* Overlay (click to close) */}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${open ? "active" : ""}`}>

        <div className="close-btn" onClick={() => setOpen(false)}>
          ✖
        </div>

        <button onClick={() => { navigate("/requests"); setOpen(false); }}>
          View Requests
        </button>

        <button onClick={() => { navigate("/chat"); setOpen(false); }}>
          Open Chats
        </button>

        <button onClick={() => { navigate("/profile"); setOpen(false); }}>
          Edit Profile
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1>Welcome to SwapHub 🎉</h1>
        <p>Use the menu to navigate.</p>
      </div>

    </div>
  );
}

export default Dashboard;