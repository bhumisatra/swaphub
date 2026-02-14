import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const Chat = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [searchUsername, setSearchUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  // 🔥 SEARCH USER
  const handleSearch = async () => {
    if (!searchUsername) return;

    const q = query(
      collection(db, "users"),
      where("username", "==", searchUsername.toLowerCase())
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const otherUserId = querySnapshot.docs[0].id;

      const chatId =
        currentUser.uid < otherUserId
          ? `${currentUser.uid}_${otherUserId}`
          : `${otherUserId}_${currentUser.uid}`;

      const chatQuery = query(
        collection(db, "chats"),
        where("chatId", "==", chatId)
      );

      const existing = await getDocs(chatQuery);

      if (existing.empty) {
        await addDoc(collection(db, "chats"), {
          chatId,
          participants: [currentUser.uid, otherUserId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setSelectedUser({
        ...userData,
        uid: otherUserId,
        chatId,
      });
    } else {
      alert("User not found");
    }
  };

  // 🔥 LOAD SIDEBAR CHATS
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => doc.data());
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 🔥 LOAD MESSAGES
  useEffect(() => {
    if (!selectedUser) return;

    const messagesRef = collection(
      db,
      "chats",
      selectedUser.chatId,
      "messages"
    );

    const q = query(messagesRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // 🔥 SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    const messagesRef = collection(
      db,
      "chats",
      selectedUser.chatId,
      "messages"
    );

    await addDoc(messagesRef, {
      text: message,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    setMessage("");
  };

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="chat-sidebar">
        <h3>Chats</h3>

        <input
          type="text"
          placeholder="Search username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>

        {chats.map((chat) => {
          const otherUserId = chat.participants.find(
            (id) => id !== currentUser.uid
          );

          return (
            <div
              key={chat.chatId}
              className="chat-user"
              onClick={() =>
                setSelectedUser({ uid: otherUserId, chatId: chat.chatId })
              }
            >
              {chat.chatId}
            </div>
          );
        })}
      </div>

      {/* CHAT WINDOW */}
      <div className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              @{selectedUser.username || selectedUser.uid}
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.senderId === currentUser.uid
                      ? "message own"
                      : "message"
                  }
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;