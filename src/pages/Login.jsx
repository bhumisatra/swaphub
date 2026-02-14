import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Login successful");   // 👈 ADD THIS
      navigate("/profile-setup");        // 👈 or "/dashboard"

    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;