import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Welcome to SwapHub 🎉</h2>

        <div className="dashboard-buttons">
          <button onClick={() => navigate("/requests")}>
            View Requests
          </button>

          <button onClick={() => navigate("/chat")}>
            Open Chats
          </button>

          <button onClick={() => navigate("/profile-setup")}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;