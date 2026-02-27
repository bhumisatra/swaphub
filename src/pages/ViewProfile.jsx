import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/viewProfile.css";

function ViewProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [completedSwaps, setCompletedSwaps] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
      else setUserData(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    const unsub1 = onSnapshot(
      collection(db, "users", uid, "followers"),
      (snap) => {
        setFollowers(snap.size);
      }
    );

    const unsub2 = onSnapshot(
      collection(db, "users", uid, "following"),
      (snap) => {
        setFollowing(snap.size);
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);
  useEffect(() => {
  if (!uid) return;

  const fetchCompleted = async () => {

    // swaps where user is part of AND completed
    const q = query(
      collection(db, "swaps"),
      where("users", "array-contains", uid),
      where("status", "==", "completed")
    );

    const snap = await getDocs(q);
    setCompletedSwaps(snap.size);
  };

  fetchCompleted();

}, [uid]);

  useEffect(() => {
    if (!currentUser) return;

    const ref = doc(db, "users", uid, "followers", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setIsFollowing(snap.exists());
    });

    return () => unsub();
  }, [currentUser, uid]);

  const toggleFollow = async () => {
    if (!currentUser) return;

    const myUid = currentUser.uid;

    const followerRef = doc(db, "users", uid, "followers", myUid);
    const followingRef = doc(db, "users", myUid, "following", uid);

    if (isFollowing) {
      await deleteDoc(followerRef);
      await deleteDoc(followingRef);
    } else {
      await setDoc(followerRef, { uid: myUid });
      await setDoc(followingRef, { uid: uid });
    }
  };

  /* 🔥 FIXED MESSAGE BUTTON */
const openChat = async () => {
  if (!currentUser) return;

  const myUID = currentUser.uid;
  const targetUID = uid;

  // SAME ID LOGIC AS CHAT.JSX
  const chatId =
    myUID > targetUID
      ? myUID + targetUID
      : targetUID + myUID;

  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);

  // CREATE CHAT IN CORRECT FORMAT
  if (!snap.exists()) {
    await setDoc(chatRef, {
      participants: [myUID, targetUID],
      usernames: {
        [myUID]: currentUser.email,
        [targetUID]: userData.username
      },
      nicknames: {},
      unread: {
        [myUID]: 0,
        [targetUID]: 0
      },
      lastMessage: "",
      createdAt: serverTimestamp(),
    });
  }

  navigate(`/dashboard/chat/${chatId}`);
};

  if (loading || currentUser === undefined)
    return <div className="profile-loading">Loading...</div>;

  if (!userData)
    return <div className="profile-loading">User not found</div>;

  const theme = userData.gender === "Female" ? "female-theme" : "male-theme";
  const isOwner = currentUser && currentUser.uid === uid;

  return (
    <div className={`profile-page ${theme}`}>
      <div className="vp-top-bar">
        <div className="vp-avatar">
          {userData.photoURL ? (
            <img src={userData.photoURL} alt="profile" />
          ) : (
            <div className="avatar-letter">
              {userData.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

       <div className="vp-user-main">
  <h1>{userData.username}</h1>
  <p>{userData.bio || "Welcome to my profile ✨"}</p>

  {/* ⭐ RELIABILITY */}
  {userData?.totalSwaps > 0 && (
    <div className="reputation-box">

      <div className="rep-score">
        ⭐ {userData?.reliability || 100}%
      </div>

      <div className="rep-meta">
        {userData?.totalSwaps} swaps completed • {userData?.lateSwaps || 0} late
      </div>

    </div>
  )}
</div>

        <div className="vp-actions">
          {!isOwner && (
            <div className="profile-action-buttons">
              <button className="follow-btn" onClick={toggleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </button>

              <button className="message-btn" onClick={openChat}>
                Message
              </button>
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
      </div>

     <div className="vp-stats">
  <div>
    <strong>{followers}</strong>
    <span>Followers</span>
  </div>

  <div>
    <strong>{following}</strong>
    <span>Following</span>
  </div>

  <div>
    <strong>{completedSwaps}</strong>
    <span>Completed Swaps</span>
  </div>
</div>

      <section className="profile-section">
        <h2>About Me</h2>
        <div className="glass-card">
          {userData.about || "No description added yet."}
        </div>
      </section>

      <section className="profile-section">
        <h2>Skills</h2>
        <div className="glass-card skills-card">
          {userData.skills?.length ? (
            userData.skills.map((skill, i) => (
              <span key={i} className="skill">
                {skill}
              </span>
            ))
          ) : (
            <p>No skills added</p>
          )}
        </div>
      </section>
      <section className="profile-section">
  <h2>Personal Info</h2>

  <div className="glass-card info-card">

    {userData.dob && (
      <div className="info-row">
        <span className="info-label">Date of Birth</span>
        <span className="info-value">{userData.dob}</span>
      </div>
    )}

    {userData.gender && (
      <div className="info-row">
        <span className="info-label">Gender</span>
        <span className="info-value">{userData.gender}</span>
      </div>
    )}

    {userData.qualification && (
      <div className="info-row">
        <span className="info-label">Qualification</span>
        <span className="info-value">{userData.qualification}</span>
      </div>
    )}

    {userData.location && (
      <div className="info-row">
        <span className="info-label">Location</span>
        <span className="info-value">📍 {userData.location}</span>
      </div>
    )}
    {userData.available && (
      <div className="info-row">
        <span className="info-label">Availability</span>
        <span className="info-value"> {userData.available}</span>
      </div>
    )}

    {/* Show email ONLY to owner */}
    {isOwner && (
      <div className="info-row">
        <span className="info-label">Email</span>
        <span className="info-value">{currentUser.email}</span>
      </div>
    )}

  </div>
</section>
    </div>
  );
}

export default ViewProfile;