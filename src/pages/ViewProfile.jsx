import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/viewProfile.css";

const maskEmail = (email) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return "****@" + domain;
  return name.slice(0, 2) + "****@" + domain;
};

function ViewProfile() {
  const { uid } = useParams();
  const currentUser = auth.currentUser;
  const isOwnProfile = currentUser?.uid === uid;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    };
    fetchUser();
  }, [uid]);

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!userData) return <div className="profile-loading">User not found</div>;

  const theme = userData.gender === "female" ? "female-theme" : "male-theme";

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
        </div>
      </section>

      {/* ABOUT */}
      <section className="profile-section">
        <h2>About Me</h2>
        <div className="card">
          <p>{userData.about || "No description added yet."}</p>
        </div>
      </section>

      {/* SKILLS */}
      <section className="profile-section">
        <h2>Skills</h2>
        <div className="skills">
          {userData.skills?.length ? (
            userData.skills.map((skill, i) => (
              <span key={i} className="skill">{skill}</span>
            ))
          ) : (
            <p>No skills added</p>
          )}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="profile-section">
        <h2>Projects</h2>
        <div className="projects">
          {userData.projects?.length ? (
            userData.projects.map((p, i) => (
              <div className="project-card" key={i}>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <small>{p.tech}</small>
              </div>
            ))
          ) : (
            <p>No projects yet</p>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section className="profile-section contact">
        <h2>Contact</h2>
        <p className="email">
          {isOwnProfile ? userData.email : maskEmail(userData.email)}
        </p>
      </section>

    </div>
  );
}

export default ViewProfile;