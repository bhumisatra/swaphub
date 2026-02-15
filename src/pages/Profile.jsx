import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  // 🔥 WAIT FOR AUTH USER SAFELY
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ CLOUDINARY IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "swaphub_profile");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dfq0pmt5y/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!data.secure_url) {
        alert("Upload failed");
        setUploading(false);
        return;
      }

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: data.secure_url
      });

      setUserData({ ...userData, photoURL: data.secure_url });

    } catch (error) {
      console.error(error);
      alert("Upload error");
    }

    setUploading(false);
  };

  // ✅ USERNAME SYSTEM
  const handleSetUsername = async () => {
    if (!usernameInput || !auth.currentUser) return alert("Enter username");

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

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
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

        {/* Avatar */}
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
          <div className="username-box">
            <input
              type="text"
              placeholder="Set unique username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <button onClick={handleSetUsername}>
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

        {/* 🔥 EDIT PROFILE BUTTON — NOW ALWAYS WORKS */}
        <button
          className="edit-profile-btn"
          onClick={() => navigate("edit-profile")}
        >
          Edit Profile Info
        </button>

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