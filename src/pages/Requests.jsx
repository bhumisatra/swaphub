import { useNavigate } from "react-router-dom";
import "../styles/requests.css";

export default function Requests() {

  const navigate = useNavigate();

  const categories = [
    "Language",
    "Coding",
    "Art",
    "Tech",
    "Instruments",
    "Fitness"
  ];

  const openCommunity = (cat) => {
    if (!cat) return;

    const route = cat.toLowerCase().trim(); // safety
    navigate(`/dashboard/community/${encodeURIComponent(route)}`);
  };

  return (
    <div className="requests-container">
      <h1 className="req-title">Choose a Community</h1>

      <div className="circle-grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="circle-card"
            onClick={() => openCommunity(cat)}
          >
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}