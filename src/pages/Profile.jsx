import React, { useState, useEffect } from "react";
import "../styles/profile.css";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    gender: "",
    dob: "",
    swaps: "",
    rating: "",
    reviews: "",
    skills: ""
  });

  // Load data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("swaphubUser"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Handle input
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save data
  const handleSave = () => {
    localStorage.setItem("swaphubUser", JSON.stringify(user));
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">

        {/* HEADER */}
        <div className="profile-header">

          <div className="profile-name">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                placeholder="Full Name"
              />
            ) : (
              user.name || "Your Name"
            )}
          </div>

          <div className="profile-username">
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
                placeholder="@username"
              />
            ) : (
              user.username || "@username"
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              {isEditing ? (
                <input
                  type="number"
                  name="swaps"
                  value={user.swaps}
                  onChange={handleChange}
                  placeholder="Swaps"
                />
              ) : (
                <div className="stat-number">{user.swaps || 0}</div>
              )}
              <div className="stat-label">Swaps</div>
            </div>

            <div className="stat-item">
              {isEditing ? (
                <input
                  type="text"
                  name="rating"
                  value={user.rating}
                  onChange={handleChange}
                  placeholder="Rating"
                />
              ) : (
                <div className="stat-number">{user.rating || 0}</div>
              )}
              <div className="stat-label">Rating</div>
            </div>

            <div className="stat-item">
              {isEditing ? (
                <input
                  type="number"
                  name="reviews"
                  value={user.reviews}
                  onChange={handleChange}
                  placeholder="Reviews"
                />
              ) : (
                <div className="stat-number">{user.reviews || 0}</div>
              )}
              <div className="stat-label">Reviews</div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="profile-section">
          <h3>Personal Information</h3>

          <div className="info-grid">

            <div className="info-item">
              <div className="info-label">Email</div>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                />
              ) : (
                <div className="info-value">{user.email || "-"}</div>
              )}
            </div>

            <div className="info-item">
              <div className="info-label">Gender</div>
              {isEditing ? (
                <input
                  type="text"
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                />
              ) : (
                <div className="info-value">{user.gender || "-"}</div>
              )}
            </div>

            <div className="info-item">
              <div className="info-label">Date of Birth</div>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={user.dob}
                  onChange={handleChange}
                />
              ) : (
                <div className="info-value">{user.dob || "-"}</div>
              )}
            </div>

          </div>
        </div>

        {/* SKILLS */}
        <div className="profile-section">
          <h3>Skills</h3>

          {isEditing ? (
            <textarea
              name="skills"
              value={user.skills}
              onChange={handleChange}
              placeholder="Enter skills separated by commas"
            />
          ) : (
            <div className="info-value">
              {user.skills || "No skills added yet"}
            </div>
          )}
        </div>

        {/* BUTTON */}
        <div style={{ marginTop: "20px" }}>
          {isEditing ? (
            <button className="edit-profile-btn" onClick={handleSave}>
              Save Changes
            </button>
          ) : (
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;