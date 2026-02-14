import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../styles/profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    fetchUser();
  }, []);

  // ✅ PROFILE IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "users", currentUser.uid), {
      photoURL: downloadURL
    });

    setUserData({ ...userData, photoURL: downloadURL });
    setUploading(false);
  };

  // ✅ USERNAME LOGIC (unchanged)
  const handleSetUsername = async () => {
    if (!usernameInput) return alert("Enter username");

    setSaving(true);

    const q = query(
      collection(db, "users"),
      where("username", "==", usernameInput.toLowerCase())
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("Username already taken");
      setSaving(false);
      return;
    }

    await updateDoc(doc(db, "users", currentUser.uid), {
      username: usernameInput.toLowerCase()
    });

    setUserData({ ...userData, username: usernameInput.toLowerCase() });
    setUsernameInput("");
    setSaving(false);

    alert("Username saved successfully!");
  };

  if (!userData) return <h2>Loading...</h2>;

  const firstLetter = userData.username
    ? userData.username.charAt(0).toUpperCase()
    : userData.email.charAt(0).toUpperCase();

  return (
    <div className="profile-wrapper">

      {/* Cover */}
      <div className="profile-cover"></div>

      {/* Header */}
      <div className="profile-header">

        {/* 🔥 Professional Avatar */}
        <div className="profile-avatar">
          {userData.photoURL ? (
            <img src={userData.photoURL} alt="Profile" />
          ) : (
            firstLetter
          )}
        </div>

        <label className="upload-btn">
          {uploading ? "Uploading..." : "Change Photo"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </label>

        <h2>{userData.name || "User"}</h2>

        {userData.username ? (
          <p>@{userData.username}</p>
        ) : (
          <div style={{ marginTop: "15px" }}>
            <input
              type="text"
              placeholder="Set unique username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              style={{ padding: "8px" }}
            />
            <button
              onClick={handleSetUsername}
              style={{ marginLeft: "10px" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        <div className="profile-stats">
          <div>
            <h3>0</h3>
            <span>Requests</span>
          </div>
          <div>
            <h3>0</h3>
            <span>Chats</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="profile-details">
        <div className="profile-card">
          <h3>Personal Info</h3>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>DOB:</strong> {userData.dob || "Not set"}</p>
          <p><strong>Gender:</strong> {userData.gender || "Not set"}</p>
        </div>
      </div>

    </div>
  );
}

export default Profile;