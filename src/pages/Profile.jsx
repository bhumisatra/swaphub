import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;

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
    <div>
      <h2>My Profile</h2>
      <p><strong>Name:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>DOB:</strong> {userData.dob}</p>
      <p><strong>Gender:</strong> {userData.gender}</p>
    </div>
  );
}

export default Profile;