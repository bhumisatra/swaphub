import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, onSnapshot, collection, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/viewProfile.css";

function ViewProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ NEW STATES
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // 🔥 WAIT FOR AUTH
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

  // ⭐ FOLLOWERS COUNT LISTENER
  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "users", uid, "followers"), snap => {
      setFollowers(snap.size);
    });

    const unsub2 = onSnapshot(collection(db, "users", uid, "following"), snap => {
      setFollowing(snap.size);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);

  // ⭐ CHECK IF I FOLLOW THIS USER
  useEffect(() => {
    if (!currentUser) return;

    const ref = doc(db, "users", uid, "followers", currentUser.uid);
    const unsub = onSnapshot(ref, snap => {
      setIsFollowing(snap.exists());
    });

    return () => unsub();
  }, [currentUser, uid]);

  // ⭐ FOLLOW / UNFOLLOW FUNCTION
  const toggleFollow = async () => {
    if (!currentUser) return;

    const myUid = currentUser.uid;

    const followerRef = doc(db, "users", uid, "followers", myUid);
    const followingRef = doc(db, "users", myUid, "following", uid);

    if (isFollowing) {
      // UNFOLLOW
      await deleteDoc(followerRef);
      await deleteDoc(followingRef);
    } else {
      // FOLLOW
      await setDoc(followerRef, { uid: myUid });
      await setDoc(followingRef, { uid: uid });
    }
  };

  if (loading || currentUser === undefined)
    return <div className="profile-loading">Loading...</div>;

  if (!userData) return <div className="profile-loading">User not found</div>;

  const theme = userData.gender === "Female" ? "female-theme" : "male-theme";
  const isOwner = currentUser && currentUser.uid === uid;

  return (
    <div className={`profile-page ${theme}`}>

      {/* HERO */}
      <section className="profile-hero">
        <div className="hero-text">
          <h1>Hi there, I'm {userData.username}</h1>
          <p>{userData.bio || "Welcome to my profile ✨"}</p>

          {/* ⭐ FOLLOW STATS */}
          <div className="follow-stats">
            <div>
              <strong>{followers}</strong>
              <span>Followers</span>
            </div>
            <div>
              <strong>{following}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>

        <div className="hero-avatar">
          {userData.photoURL ? (
            <img src={userData.photoURL} alt="profile"/>
          ) : (
            <div className="avatar-letter">
              {userData.username?.charAt(0).toUpperCase()}
            </div>
          )}

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


      {/* ===== NEW LAYOUT START ===== */}
      <div className="profile-bottom-layout">

        {/* LEFT SIDE */}
        <div className="profile-left-panel">

          {!isOwner && (
            <button className="follow-btn" onClick={toggleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}

          <div className="glass-card contact-card">
            <p>Start a conversation</p>
            <button className="chat-btn">Chat</button>
          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="profile-right-panel">

          {/* ABOUT */}
          <section className="profile-section">
            <h2>About Me</h2>
            <div className="glass-card">
              {userData.about || "No description added yet."}
            </div>
          </section>

          {/* SKILLS */}
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

      </div>
      {/* ===== NEW LAYOUT END ===== */}

    </div>
  );
}

export default ViewProfile;