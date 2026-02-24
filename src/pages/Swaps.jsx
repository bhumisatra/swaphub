import "../styles/swaps.css";

export default function Swaps() {
  return (
    <div className="swaps-wrapper">

      <h1 className="swaps-title">Swaps</h1>

      <div className="swaps-section">
        <h2>Pending Swaps</h2>

        <div className="swap-card">
          <div className="swap-user">Alex</div>
          <div className="swap-status pending">Waiting for response</div>
        </div>

        <div className="swap-card">
          <div className="swap-user">Maria</div>
          <div className="swap-status pending">Waiting for response</div>
        </div>
      </div>


      <div className="swaps-section">
        <h2>Completed Swaps</h2>

        <div className="swap-card completed">
          <div className="swap-user">John</div>
          <div className="swap-status completed">Completed</div>
        </div>

      </div>

    </div>
  );
}