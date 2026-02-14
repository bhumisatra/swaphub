import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

function ProfileSetup() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await setDoc(doc(db, "users", auth.currentUser.uid), {
      name,
      dob,
      gender,
      email: auth.currentUser.email
    });

    navigate("/dashboard");
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Complete Your Profile</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="date"
            onChange={(e) => setDob(e.target.value)}
            required
          />

          <select onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <button>Save & Continue</button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;