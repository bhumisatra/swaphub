import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/viewProfile.css";

/* ================= EMAIL MASK FUNCTION ================= */
const maskEmail = (email) => {
  if (!email) return "";

  const [name, domain] = email.split("@");

  if (name.length <= 2) return "****@" + domain;

  const visible = name.slice(0, 2);
  return `${visible}****@${domain}`;
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

      if (snap.exists()) {
        setUserData(snap.data());
      }

      setLoading(false);
    };

    fetchUser();
  }, [uid]);

  if (loading) {
    return (
      <div className="profile-view-wrapper">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-view-wrapper">
        <div className="profile-loading">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-view-wrapper">
      <div className="profile-card">

        {/* Profile Image */}
        <div className="profile-image-wrapper">
          {userData.photoURL ? (
            <img
              src={userData.photoURL}
              alt="profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-avatar">
              {userData.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="profile-info">
          <h2>{userData.username}</h2>

          {/* EMAIL (MASKED FOR OTHERS) */}
          <p className="profile-email">
            {isOwnProfile ? userData.email : maskEmail(userData.email)}
          </p>

          {userData.bio && (
            <p className="profile-bio">{userData.bio}</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default ViewProfile;