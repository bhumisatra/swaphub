import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import "../styles/community.css";

export default function Community() {

  const params = useParams();
  const name = params?.name || "";

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // REALTIME LISTENER
  useEffect(() => {
    if (!name) return;

    const q = query(
      collection(db, "communities", name, "messages"),
      orderBy("time", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {

      // 🔥 VERY IMPORTANT FIX
      const safeMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => msg.text && msg.time); // ignore firebase pending writes

      setMessages(safeMessages);
      setLoaded(true);
    });

    return () => unsub();

  }, [name]);

  const sendMessage = async () => {
    if (!text.trim() || !name) return;

    await addDoc(collection(db, "communities", name, "messages"), {
      text: text.trim(),
      user: "Anonymous",
      time: serverTimestamp()
    });

    setText("");
  };

  // Prevent white screen before router loads
  if (!name) {
    return <div style={{ padding: 40 }}>Opening community...</div>;
  }

  return (
    <div className="community-container">

      <h1 className="community-title">
        {name.toUpperCase()} COMMUNITY
      </h1>

      <div className="messages-box">

        {!loaded && <p>Connecting...</p>}

        {loaded && messages.length === 0 && (
          <p>No messages yet. Be the first 👇</p>
        )}

        {messages.map(msg => (
          <div key={msg.id} className="message">
            <b>{msg.user}</b>
            <p>{msg.text}</p>
          </div>
        ))}

      </div>

      <div className="send-box">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}