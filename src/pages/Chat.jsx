import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Temporary fixed chat ID for now
  const chatId = "globalChat";

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });

    setMessage("");
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <h2>Chat Room</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.senderId === auth.currentUser.uid
                ? "my-message"
                : "other-message"
            }
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;