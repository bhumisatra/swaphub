import "../styles/home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <h1>Swap Services. Not Money.</h1>
        <p>Help someone → Get help back</p>
        <button onClick={() => navigate("/dashboard/requests")} className="cta">Start Swapping</button>
      </section>


      {/* HOW IT WORKS */}
      <section className="how">
        <h2>How It Works</h2>

        <div className="how-grid">

          <div className="how-card">
            <h3>1. Join Community</h3>
            <p>Choose what you can teach or learn</p>
          </div>

          <div className="how-card">
            <h3>2. Post Request</h3>
            <p>Write what you need & what you offer</p>
          </div>

          <div className="how-card">
            <h3>3. Chat & Match</h3>
            <p>Talk and decide the exchange</p>
          </div>

          <div className="how-card">
            <h3>4. Complete Swap</h3>
            <p>Finish work & build trust</p>
          </div>

        </div>
      </section>


      {/* REAL USE CASES */}
      <section className="cases">
        <h2>Real Use Cases</h2>

        <div className="case-grid">

          <div className="case-card">
            <h3>🎓 Students</h3>
            <p>PPT help ↔ Python help</p>
          </div>

          <div className="case-card">
            <h3>🏋️ Fitness</h3>
            <p>Workout plan ↔ Logo design</p>
          </div>

          <div className="case-card">
            <h3>🎨 Freelancers</h3>
            <p>Website ↔ Branding</p>
          </div>

          <div className="case-card">
            <h3>🌍 Language</h3>
            <p>English ↔ Japanese speaking</p>
          </div>

          <div className="case-card">
            <h3>📱 Creators</h3>
            <p>Editing ↔ Thumbnails</p>
          </div>

        </div>
      </section>

    </div>
  );
}