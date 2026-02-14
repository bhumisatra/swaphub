import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";

function Chat() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    await addDoc(collection(db, "messages"), {
      text: message,
      chatId: id,
      user: auth.currentUser.email,
      createdAt: new Date()
    });

    setMessage("");
  };

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [id]);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Chat</h2>

      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;