import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import signupImage from "../assets/whatsapp.jpeg"; // same image
import "../styles/signup.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        username,
        email,
        createdAt: new Date()
      });

      navigate("/dashboard");
    } catch (error) {
      alert("Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="circle top"></div>
      <div className="circle bottom"></div>

      <div className="signup-card">

        {/* LEFT SIDE */}
        <div className="signup-left">
          <h1>CREATE ACCOUNT</h1>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">SIGN UP</button>
          </form>

          <div className="signup-links">
            <span>Already have an account?</span>
            <Link to="/">LOGIN</Link>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="signup-right">
          <img src={signupImage} alt="Signup Illustration" />
        </div>

      </div>
    </div>
  );
}

export default Signup;