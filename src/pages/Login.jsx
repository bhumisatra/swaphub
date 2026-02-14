import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile-setup");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>SwapHub Login</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="email"
              placeholder="User name / Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn">LOG IN NOW →</button>
        </form>

        <p>
          Don't have account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
