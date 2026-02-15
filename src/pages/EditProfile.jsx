import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/editProfile.css";

function EditProfile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");

  // 🔥 WAIT FOR AUTH PROPERLY
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);

      const snap = await getDoc(doc(db, "users", currentUser.uid));

      if (snap.exists()) {
        const userData = snap.data();
        setData(userData);
        setAbout(userData.about || "");
        setSkills((userData.skills || []).join(", "));
      }
    });

    return () => unsub();
  }, []);

  // 🔥 SAVE PROFILE
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    await updateDoc(doc(db, "users", user.uid), {
      about: about,
      skills: skills.split(",").map(s => s.trim()).filter(Boolean)
    });

    setSaving(false);

    // go back to view profile
    navigate(`/dashboard/profile/${user.uid}`);
  };

  if (!data) return <div className="edit-loading">Loading profile...</div>;

  return (
    <div className="edit-profile-page">

      <h1>Edit Your Profile</h1>

      <div className="edit-card">

        <label>About You</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Write something about yourself..."
        />

        <label>Skills (comma separated)</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, UI Design, Video Editing"
        />

        <button onClick={handleSave}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  );
}

export default EditProfile;