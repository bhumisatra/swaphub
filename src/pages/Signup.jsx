import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    await createUserWithEmailAndPassword(auth, email, password);
    navigate("/requests");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>SwapHub Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Signup</button>
      </form>

      <p>
        Already have account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Signup;