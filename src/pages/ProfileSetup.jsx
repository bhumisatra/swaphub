import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };
    fetchData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>{userData.name}</h2>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>DOB:</strong> {userData.dob}</p>
        <p><strong>Gender:</strong> {userData.gender}</p>
      </div>
    </div>
  );
}

export default Profile;
