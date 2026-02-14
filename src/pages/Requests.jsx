import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

function Requests() {
  const [service, setService] = useState("");
  const [requests, setRequests] = useState([]);

  const handleAdd = async () => {
    if (!service) return;

    await addDoc(collection(db, "requests"), {
      service,
      user: auth.currentUser.email,
      createdAt: new Date()
    });

    setService("");
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Service Requests</h2>

      <input
        value={service}
        onChange={(e) => setService(e.target.value)}
        placeholder="Offer or request service"
      />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            {req.service} - {req.user}
            <Link to={`/chat/${req.id}`}> Chat</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Requests;