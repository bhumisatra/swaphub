import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/viewProfile.css";

function ViewProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 WAIT FOR AUTH (IMPORTANT FIX)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // 🔥 REALTIME PROFILE LISTENER
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
      else setUserData(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  if (loading || currentUser === undefined)
    return <div className="profile-loading">Loading...</div>;

  if (!userData) return <div className="profile-loading">User not found</div>;

  const theme = userData.gender === "Female" ? "female-theme" : "male-theme";

  // 🔥 NOW THIS WILL WORK CORRECTLY
  const isOwner = currentUser && currentUser.uid === uid;

  return (
    <div className={`profile-page ${theme}`}>

      {/* HERO */}
      <section className="profile-hero">
        <div className="hero-text">
          <h1>Hi there, I'm {userData.username}</h1>
          <p>{userData.bio || "Welcome to my profile ✨"}</p>
        </div>

        <div className="hero-avatar">
          {userData.photoURL ? (
            <img src={userData.photoURL} alt="profile"/>
          ) : (
            <div className="avatar-letter">
              {userData.username?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* 🔥 EDIT BUTTON */}
          {isOwner && (
            <button
              className="edit-profile-btn"
              onClick={() => navigate("../edit-profile", { replace: true })}
            >
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* ABOUT CARD */}
      <section className="profile-section">
        <h2>About Me</h2>
        <div className="glass-card">
          {userData.about || "No description added yet."}
        </div>
      </section>

      {/* SKILLS CARD */}
      <section className="profile-section">
        <h2>Skills</h2>
        <div className="glass-card skills-card">
          {userData.skills?.length ? (
            userData.skills.map((skill, i) => (
              <span key={i} className="skill">{skill}</span>
            ))
          ) : (
            <p>No skills added</p>
          )}
        </div>
      </section>

    </div>
  );
}

export default ViewProfile;