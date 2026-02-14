import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc
} from "firebase/firestore";
import "../styles/signup.css";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (username.length < 4) {
      alert("Username must be at least 4 characters");
      return;
    }

    try {
      setLoading(true);

      // 🔎 Check if username exists
      const q = query(
        collection(db, "users"),
        where("username", "==", username.toLowerCase())
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("Username already taken");
        setLoading(false);
        return;
      }

      // 🔐 Create user in Firebase Auth
      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      // 💾 Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        username: username.toLowerCase(),
        name: "",
        dob: "",
        gender: "",
        createdAt: new Date()
      });

      alert("Account Created Successfully!");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSignup}>
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Choose Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.toLowerCase())
          }
          required
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button type="submit">
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p>
          Already have account?
          <span onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;