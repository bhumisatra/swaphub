import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import "../styles/chat.css";

export default function Chat() {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [usernameInput, setUsernameInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatList, setChatList] = useState([]);

  const generateChatId = (uid1, uid2) => {
    return uid1 > uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;
  };

  const searchUser = async () => {
    const q = query(
      collection(db, "users"),
      where("username", "==", usernameInput)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const user = snapshot.docs[0].data();
      setSelectedUser(user);

      const id = generateChatId(currentUser.uid, snapshot.docs[0].id);
      setChatId(id);

      if (!chatList.find(c => c.chatId === id)) {
        setChatList([...chatList, { chatId: id, user }]);
      }
    }
  };

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "messages"), {
      chatId,
      text: newMessage,
      sender: currentUser.uid,
      createdAt: new Date()
    });

    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2>Chats</h2>

        <div className="search-box">
          <input
            placeholder="Search username"
            value={usernameInput}
            onChange={e => setUsernameInput(e.target.value)}
          />
          <button onClick={searchUser}>Search</button>
        </div>

        <div className="chat-list">
          {chatList.map((chat, index) => (
            <div
              key={index}
              className="chat-user"
              onClick={() => setChatId(chat.chatId)}
            >
              @{chat.user.username}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {chatId ? (
          <>
            <div className="chat-header">
              @{selectedUser?.username}
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === currentUser.uid
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
                placeholder="Type a message"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}