import React, { useEffect, useState } from "react";
import "../styles/profile.css";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    gender: "",
    dob: "",
    skills: []
  });

  useEffect(() => {
    // Get saved data from localStorage
    const storedUser = JSON.parse(localStorage.getItem("swaphubUser"));

    if (storedUser) {
      setUser({
        name: storedUser.name || "John Doe",
        username: storedUser.username || "@swaphub_user",
        email: storedUser.email || "example@email.com",
        gender: storedUser.gender || "Not specified",
        dob: storedUser.dob || "Not specified",
        skills: storedUser.skills || ["Web Design", "Editing", "Photography"]
      });
    }
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-wrapper">

        {/* HEADER */}
        <div className="profile-header">
          <img
            src="https://i.pravatar.cc/150"
            alt="profile"
            className="profile-avatar"
          />

          <div className="profile-name">{user.name}</div>
          <div className="profile-username">{user.username}</div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">12</div>
              <div className="stat-label">Swaps</div>
            </div>

            <div className="stat-item">
              <div className="stat-number">4.8</div>
              <div className="stat-label">Rating</div>
            </div>

            <div className="stat-item">
              <div className="stat-number">5</div>
              <div className="stat-label">Reviews</div>
            </div>
          </div>

          <button className="edit-profile-btn">
            Edit Profile
          </button>
        </div>

        {/* PERSONAL INFO SECTION */}
        <div className="profile-section">
          <h3>Personal Information</h3>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Full Name</div>
              <div className="info-value">{user.name}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{user.email}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Gender</div>
              <div className="info-value">{user.gender}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Date of Birth</div>
              <div className="info-value">{user.dob}</div>
            </div>
          </div>
        </div>

        {/* SKILLS SECTION */}
        <div className="profile-section">
          <h3>Skills</h3>

          <div className="skills-container">
            {user.skills.length > 0 ? (
              user.skills.map((skill, index) => (
                <div key={index} className="skill-badge">
                  {skill}
                </div>
              ))
            ) : (
              <div>No skills added yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;