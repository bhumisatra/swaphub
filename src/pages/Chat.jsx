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
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {
  const currentUser = auth.currentUser;

  const [usernameSearch, setUsernameSearch] = useState("");
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const generateChatId = (uid1, uid2) => {
    return uid1 > uid2 ? uid1 + uid2 : uid2 + uid1;
  };

  // 🔹 Load all chats of current user
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatList(chats);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Start chat
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

    const chatRef = doc(db, "chats", chatId);

    await setDoc(
      chatRef,
      {
        participants: [currentUser.uid, otherUser.id],
        usernames: {
          [currentUser.uid]: currentUser.email,
          [otherUser.id]: otherUser.data().username,
        },
        lastMessage: "",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    setUsernameSearch("");
  };

  // 🔹 Load messages
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
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
      collection(db, "chats", activeChat.id, "messages"),
      {
        text: newMessage,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      }
    );

    await updateDoc(doc(db, "chats", activeChat.id), {
      lastMessage: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="chat-wrapper">

      {/* LEFT SIDE */}
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

        {chatList.map((chat) => {
          const otherUid = chat.participants.find(
            (uid) => uid !== currentUser.uid
          );

          return (
            <div
              key={chat.id}
              className={`chat-item ${
                activeChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => setActiveChat(chat)}
            >
              {chat.usernames?.[otherUid] || "User"}
              <div style={{ fontSize: "12px", color: "gray" }}>
                {chat.lastMessage}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT SIDE */}
      <div className="chat-main">
        {activeChat ? (
          <>
            <div className="chat-header">
              Chat
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