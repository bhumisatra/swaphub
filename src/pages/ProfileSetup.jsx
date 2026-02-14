import { useState } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function ProfileSetup() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      await setDoc(doc(db, "users", user.uid), {
        name,
        dob,
        gender,
        email: user.email,
        createdAt: new Date()
      });

      alert("Profile saved successfully!");
      navigate("/dashboard");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>

      <form onSubmit={handleSave}>
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

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default ProfileSetup;