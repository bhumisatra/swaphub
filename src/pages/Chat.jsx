import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {
  const currentUser = auth.currentUser;

  const [usernameSearch, setUsernameSearch] = useState("");
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 🔹 Generate unique chatId
  const generateChatId = (uid1, uid2) => {
    return uid1 > uid2 ? uid1 + uid2 : uid2 + uid1;
  };

  // 🔹 Start chat by username
  const startChat = async () => {
    if (!usernameSearch) return;

    const q = query(
      collection(db, "users"),
      where("username", "==", usernameSearch)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("User not found");
      return;
    }

    const otherUser = snap.docs[0];
    const chatId = generateChatId(currentUser.uid, otherUser.id);

    setActiveChat({
      chatId,
      username: otherUser.data().username,
      uid: otherUser.id,
    });

    setUsernameSearch("");
  };

  // 🔹 Load messages
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, "chats", activeChat.chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [activeChat]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!newMessage || !activeChat) return;

    await addDoc(
      collection(db, "chats", activeChat.chatId, "messages"),
      {
        text: newMessage,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      }
    );

    setNewMessage("");
  };

  return (
    <div className="chat-wrapper">

      {/* LEFT SIDE - CHAT LIST */}
      <div className="chat-sidebar">
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search username..."
            value={usernameSearch}
            onChange={(e) => setUsernameSearch(e.target.value)}
          />
          <button onClick={startChat}>Start</button>
        </div>

        {activeChat && (
          <div
            className="chat-item active"
            onClick={() => setActiveChat(activeChat)}
          >
            @{activeChat.username}
          </div>
        )}
      </div>

      {/* RIGHT SIDE - CHAT WINDOW */}
      <div className="chat-main">

        {activeChat ? (
          <>
            <div className="chat-header">
              @{activeChat.username}
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
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            Select or start a conversation
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;