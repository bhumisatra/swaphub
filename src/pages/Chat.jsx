import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import Navbar from "../components/Navbar";

function Chat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "chats", id, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = e.target.message.value;

    await addDoc(collection(db, "chats", id, "messages"), {
      text: text,
      sender: auth.currentUser.uid,
      email: auth.currentUser.email,
      createdAt: new Date()
    });

    e.target.reset();
  };

  return (
    <>
      <Navbar />
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === auth.currentUser.uid
                ? "my-message"
                : "other-message"
            }
          >
            {msg.text}
          </div>
        ))}

        <form onSubmit={sendMessage}>
          <input name="message" placeholder="Type message..." required />
          <button>Send</button>
        </form>
      </div>
    </>
  );
}

export default Chat;
