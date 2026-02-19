import { useState } from "react";
import { auth } from "../firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut
} from "firebase/auth";
import "../styles/settings.css";

function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordChange = async () => {
    if (!auth.currentUser) return;

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (!currentPassword) {
      setMessage("Enter your current password.");
      return;
    }

    try {
      // 🔐 Re-authenticate user first (REQUIRED BY FIREBASE)
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // 🔑 Now update password
      await updatePassword(auth.currentUser, newPassword);

      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage("Current password incorrect.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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
            value={auth.currentUser?.email || ""}
            disabled
          />
        </div>

        <div className="settings-item">
          <label>Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="settings-item">
          <label>New Password</label>
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