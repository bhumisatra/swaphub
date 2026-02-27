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

const formatDate = (date) => {
  if (!date) return "Not set";

  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

return (
<div className="swaps-wrapper">

<h2 className="swaps-title">My Swaps</h2>

{swaps.length === 0 && <p className="no-swaps">No swaps yet</p>}

{swaps.map(swap => {

  const isMeProposer = swap.proposer === auth.currentUser.uid;

  const myDeadline = isMeProposer
    ? swap.schedule?.deadlineA
    : swap.schedule?.deadlineB;

  const theirDeadline = isMeProposer
    ? swap.schedule?.deadlineB
    : swap.schedule?.deadlineA;

  return (
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
      <div className="swap-deadlines">
          <div className="deadline-box">
            <span className="deadline-label">Your Deadline</span>
            <span className="deadline-date">{formatDate(myDeadline)}</span>
          </div>

          <div className="deadline-box">
            <span className="deadline-label">Their Deadline</span>
            <span className="deadline-date">{formatDate(theirDeadline)}</span>
          </div>
        </div>
    </div>
  );
})}

</div>
);
}