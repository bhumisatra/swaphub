import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Swaps() {

  const [swaps, setSwaps] = useState([]);

  useEffect(() => {

    const q = query(
      collection(db, "swaps"),
      where("users", "array-contains", auth.currentUser.uid)
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
    <div style={{padding:"20px"}}>

      <h2>My Swaps</h2>

      {swaps.length === 0 && <p>No swaps yet</p>}

      {swaps.map(swap => (
        <div key={swap.id} style={{
          background:"#fff",
          padding:"15px",
          borderRadius:"12px",
          marginBottom:"12px"
        }}>
          <h3>Status: {swap.status}</h3>
          <p><b>You Offer:</b> {swap.offerA}</p>
          <p><b>They Offer:</b> {swap.offerB}</p>
        </div>
      ))}

    </div>
  );
}