import { useState } from "react";
import { auth } from "../firebase";
import { updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/settings.css";

function Settings() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
    } catch (error) {
      setMessage("Please re-login to change password.");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="settings-wrapper">
      <h2>Settings</h2>

      <div className="settings-card">
        <h3>Account</h3>

        <div className="settings-item">
          <label>Email</label>
          <input
            type="text"
            value={auth.currentUser?.email}
            disabled
          />
        </div>

        <div className="settings-item">
          <label>Change Password</label>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange}>
            Update Password
          </button>
        </div>

        {message && <p className="settings-message">{message}</p>}
      </div>

      {/* ⭐ NEW THEME SECTION */}
      <div className="settings-card">
        <h3>Appearance</h3>

        <div className="settings-item">
          <label>Customize Website Theme</label>
          <button onClick={() => navigate("/dashboard/settings/theme")}>
            Open Theme Editor
          </button>
        </div>
      </div>

      <div className="settings-card danger">
        <h3>Danger Zone</h3>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;