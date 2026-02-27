import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import "../styles/swaps.css";

export default function Swaps() {

const [swaps, setSwaps] = useState([]);

useEffect(() => {

const q = query(
  collection(db, "swaps"),
  where("users", "array-contains", auth.currentUser.uid),
  orderBy("createdAt", "desc")   // newest first
);

const unsub = onSnapshot(q, (snap) => {
  setSwaps(snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })));
});

return () => unsub();

}, []);

return (
<div className="swaps-wrapper">

<h2 className="swaps-title">My Swaps</h2>

{swaps.length === 0 && <p className="no-swaps">No swaps yet</p>}

{swaps.map(swap => (

  <div key={swap.id} className="swap-card">

    <div className="swap-users">
      <span>Status</span>
      <span className={`swap-status status-${swap.status}`}>
        {swap.status}
      </span>
    </div>

    <div className="swap-services">

      <div className="service-box">
        <div className="service-title">You Offer</div>
        {swap.offerA || "—"}
      </div>

      <div className="service-box">
        <div className="service-title">They Offer</div>
        {swap.offerB || "—"}
      </div>

    </div>

  </div>

))}

</div>
);
}