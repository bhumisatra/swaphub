import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import loginImage from "../assets/whatsapp.jpeg"; // ✅ Local Image
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      
      {/* Floating circles */}
      <div className="circle top"></div>
      <div className="circle bottom"></div>

      <div className="login-card">
        
        {/* Left Side */}
        <div className="login-left">
          <h1>LOGIN</h1>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="USERNAME"
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

            <button type="submit">SUBMIT</button>
          </form>

          <div className="login-links">
            <Link to="/signup">REGISTER</Link>
            <span>FORGOT PASSWORD</span>
          </div>
        </div>

        {/* Right Side Illustration */}
        <div className="login-right">
          <img src={loginImage} alt="Login Illustration" />
        </div>

      </div>
    </div>
  );
}

export default Login;