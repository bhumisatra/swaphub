import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {
  const currentUser = auth.currentUser;

  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // 🔹 Load friend list
  useEffect(() => {
    const fetchFriends = async () => {
      const snapshot = await getDocs(
        collection(db, "friends", currentUser.uid, "friendList")
      );

      setFriends(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    };

    fetchFriends();
  }, []);

  // 🔹 Add Friend by Email
  const addFriend = async () => {
    if (!searchEmail) return;

    const snapshot = await getDocs(collection(db, "users"));
    const user = snapshot.docs.find(
      doc => doc.data().email === searchEmail
    );

    if (!user) {
      alert("User not found");
      return;
    }

    if (user.id === currentUser.uid) {
      alert("Cannot add yourself");
      return;
    }

    await setDoc(
      doc(db, "friends", currentUser.uid, "friendList", user.id),
      {
        name: user.data().name,
        email: user.data().email
      }
    );

    alert("Friend Added!");
    setSearchEmail("");
    window.location.reload();
  };

  // 🔹 Listen for messages
  useEffect(() => {
    if (!selectedUser) return;

    const chatId =
      currentUser.uid < selectedUser.id
        ? `${currentUser.uid}_${selectedUser.id}`
        : `${selectedUser.id}_${currentUser.uid}`;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const chatId =
      currentUser.uid < selectedUser.id
        ? `${currentUser.uid}_${selectedUser.id}`
        : `${selectedUser.id}_${currentUser.uid}`;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: currentUser.uid,
      timestamp: serverTimestamp()
    });

    setMessage("");
  };

  return (
    <div className="chat-container">

      {/* LEFT PANEL */}
      <div className="chat-users">
        <h3>Chats</h3>

        {/* Add Friend */}
        <div className="add-friend">
          <input
            type="text"
            placeholder="Enter email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <button onClick={addFriend}>Add</button>
        </div>

        {friends.map(user => (
          <div
            key={user.id}
            className={`chat-user ${selectedUser?.id === user.id ? "active" : ""}`}
            onClick={() => setSelectedUser(user)}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="chat-box">
        {selectedUser ? (
          <>
            <div className="chat-header">
              {selectedUser.name}
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={
                    msg.senderId === currentUser.uid
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
                placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;