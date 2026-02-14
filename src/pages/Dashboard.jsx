import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Welcome to SwapHub 🎉</h2>
        <p>You are successfully logged in.</p>

        <button onClick={() => navigate("/profile-setup")}>
          Edit Profile
        </button>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;