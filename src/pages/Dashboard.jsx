import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "requests"),
      (snapshot) => {
        const myChats = snapshot.docs
          .map((doc) => doc.data())
          .filter(
            (req) =>
              req.userId === auth.currentUser.uid ||
              req.acceptedBy === auth.currentUser.uid
          );

        setChats(myChats);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Welcome to SwapHub 🎉</h2>

        <h3>Your Active Chats</h3>

        {chats.map((chat, index) => (
          <div key={index} className="card">
            <h4>{chat.title}</h4>
            {chat.chatId && (
              <button
                onClick={() => navigate(`/chat/${chat.chatId}`)}
              >
                Open Chat
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Dashboard;
