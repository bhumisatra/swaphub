import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import "../styles/community.css";

export default function Community() {

  const { name } = useParams();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // realtime listener
  useEffect(() => {
    if (!name) return; // 🔥 prevents crash on first render

    const ref = collection(db, "communities", name, "messages");

    const unsub = onSnapshot(ref, (snapshot) => {
      setMessages(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, [name]);

  // send message
  const sendMessage = async () => {
    if (!text.trim() || !name) return;

    await addDoc(collection(db, "communities", name, "messages"), {
      text,
      user: "Anonymous",
      time: serverTimestamp()
    });

    setText("");
  };

  // 🔥 page still preparing route param
  if (!name) return <div className="community-loading">Loading community...</div>;

  return (
    <div className="community-container">

      <h1 className="community-title">
        {name.toUpperCase()} COMMUNITY
      </h1>

      <div className="messages-box">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="message">
              <b>{msg.user}</b>
              <p>{msg.text}</p>
            </div>
          ))
        )}
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