import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    fetchProfile();
  }, []);

  if (!userData) return <h2>Loading...</h2>;

  return (
    <div className="profile-wrapper">

      {/* Cover Section */}
      <div className="profile-cover"></div>

      {/* Profile Info */}
      <div className="profile-header">
        <div className="profile-avatar">
          {userData.name?.charAt(0)}
        </div>

        <h2>{userData.name}</h2>
        <p>{userData.email}</p>

        <div className="profile-stats">
          <div>
            <h3>12</h3>
            <span>Requests</span>
          </div>
          <div>
            <h3>5</h3>
            <span>Chats</span>
          </div>
          <div>
            <h3>3</h3>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="profile-details">
        <div className="profile-card">
          <h3>Personal Info</h3>
          <p><strong>DOB:</strong> {userData.dob}</p>
          <p><strong>Gender:</strong> {userData.gender}</p>
        </div>

        <div className="profile-card">
          <h3>About</h3>
          <p>This is your SwapHub professional profile section.</p>
        </div>
      </div>

    </div>
  );
}

export default Profile;