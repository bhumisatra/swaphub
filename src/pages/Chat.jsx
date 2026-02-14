import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {
  const currentUser = auth.currentUser;

  const [searchUsername, setSearchUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 🔍 Search user by username
  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("username", "==", searchUsername.toLowerCase())
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          setSelectedUser({ id: doc.id, ...doc.data() });
        }
      });
    } else {
      alert("User not found");
    }
  };

  // 💬 Load messages real-time
  useEffect(() => {
    if (!selectedUser) return;

    const chatId =
      currentUser.uid > selectedUser.id
        ? currentUser.uid + selectedUser.id
        : selectedUser.id + currentUser.uid;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => doc.data())
      );
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // 📤 Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatId =
      currentUser.uid > selectedUser.id
        ? currentUser.uid + selectedUser.id
        : selectedUser.id + currentUser.uid;

    await addDoc(
      collection(db, "chats", chatId, "messages"),
      {
        text: newMessage,
        sender: currentUser.uid,
        createdAt: new Date()
      }
    );

    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Chats</h3>

        <input
          placeholder="Enter username"
          value={searchUsername}
          onChange={(e) =>
            setSearchUsername(e.target.value)
          }
        />

        <button onClick={handleSearch}>
          Search
        </button>

        {selectedUser && (
          <div className="user-item">
            @{selectedUser.username}
          </div>
        )}
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              @{selectedUser.username}
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === currentUser.uid
                      ? "my-message"
                      : "other-message"
                  }
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
                placeholder="Type message..."
              />
              <button onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;