import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="navbar">
      <h2>SwapHub</h2>
      <div>
        <button onClick={() => navigate("/dashboard")}>Home</button>
        <button onClick={() => navigate("/requests")}>Requests</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
