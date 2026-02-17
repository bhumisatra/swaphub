import "../styles/home.css";

function Home() {
  return (
    <div className="home-wrapper">
      <h1>Welcome to SwapHub 🎉</h1>
      <p className="subtitle">
        Your private real-time messaging platform.
      </p>

      <div className="features">
        <div className="feature-card">
          <h3>🔐 Secure Authentication</h3>
          <p>Firebase login keeps your account protected.</p>
        </div>

        <div className="feature-card">
          <h3>💬 Real-Time Messaging</h3>
          <p>Messages update instantly between users.</p>
        </div>

        <div className="feature-card">
          <h3>👤 Unique Username System</h3>
          <p>No duplicate usernames allowed.</p>
        </div>

        <div className="feature-card">
          <h3>📱 Fully Responsive</h3>
          <p>Works perfectly on laptop and mobile.</p>
         </div>

       <div className="feature-card">
<h3>🌍 Build Strong Connections</h3>
<p>Connect, collaborate, and grow together.</p>
</div>
<div className="feature-card">
<h3>💰 No Money Needed</h3>
<p>Trade skills, not money.</p>
      </div>
    </div>
</div>
  );
}

export default Home;