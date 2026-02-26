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
const [dob, setDob] = useState("");
const [gender, setGender] = useState("");
const [qualification, setQualification] = useState("");
const [location, setLocation] = useState("");
const [email, setEmail] = useState("");
const [available, setAvailability] = useState("");
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

  // NEW FIELDS LOAD
  setDob(userData.dob || "");
  setGender(userData.gender || "");
  setQualification(userData.qualification || "");
  setLocation(userData.location || "");
  setAvailability(userData.available || "");

  // always from auth
  setEmail(currentUser.email || "");
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
  skills: skills.split(",").map(s => s.trim()).filter(Boolean),

  dob: dob,
  gender: gender,
  qualification: qualification,
  location: location,
  email: email,
  available: available,
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

        <label>Date of Birth</label>
<input
  type="date"
  value={dob}
  onChange={(e) => setDob(e.target.value)}
/>

<label>Gender</label>
<select value={gender} onChange={(e)=>setGender(e.target.value)}>
  <option value="" className="gencolor">Select gender</option>
  <option value="Male" className="gencolor">Male</option>
  <option value="Female" className="gencolor">Female</option>
  <option value="Other" className="gencolor">Other</option>
</select>

<label>Email</label>
<input
  type="text"
  value={email}
  onChange={(e)=>setEmail(e.target.value)}
  placeholder="abc@hotmail.com"
/>

<label>Qualification</label>
<input
  type="text"
  value={qualification}
  onChange={(e)=>setQualification(e.target.value)}
  placeholder="BSc Computer Science / 12th / Self taught"
/>

<label>Location (Area)</label>
<input
  type="text"
  value={location}
  onChange={(e)=>setLocation(e.target.value)}
  placeholder="📍 Marine Lines / Panjim / Andheri"
/>
<label>Availability</label>
<input
  type="text"
  value={available}
  onChange={(e)=>setAvailability(e.target.value)}
  placeholder="after 4p.m"
/>

        <button onClick={handleSave}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  );
}

export default EditProfile;