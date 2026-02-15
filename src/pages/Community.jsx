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

  // realtime listener
  useEffect(() => {
    const ref = collection(db, "communities", name, "messages");

    const unsub = onSnapshot(ref, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsub();
  }, [name]);

  // send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "communities", name, "messages"), {
      text,
      user: "Anonymous",
      time: serverTimestamp()
    });

    setText("");
  };

  return (
    <div className="community-container">

      <h1 className="community-title">{name.toUpperCase()} COMMUNITY</h1>

      <div className="messages-box">
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