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
  updateDoc
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {

  /* AUTH SAFE */
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const [usernameSearch, setUsernameSearch] = useState("");
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const generateChatId = (uid1, uid2) => {
    return uid1 > uid2 ? uid1 + uid2 : uid2 + uid1;
  };

  /* LOAD CHAT LIST */
  useEffect(() => {
    if (!authReady || !currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatList(chats);
    });

    return () => unsubscribe();
  }, [authReady, currentUser]);

  /* START CHAT */
  const startChat = async () => {
    if (!usernameSearch || !currentUser) return;

    const q = query(
      collection(db, "users"),
      where("username", "==", usernameSearch)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
      alert("User not found");
      return;
    }

    const otherUser = snap.docs[0].data();
    const otherUid = otherUser.uid;

    const chatId = generateChatId(currentUser.uid, otherUid);

    await setDoc(doc(db, "chats", chatId), {
      participants: [currentUser.uid, otherUid],
      usernames: {
        [currentUser.uid]: currentUser.email,
        [otherUid]: otherUser.username
      },
      unread: {
        [currentUser.uid]: 0,
        [otherUid]: 0
      },
      lastMessage: "",
      createdAt: serverTimestamp()
    }, { merge: true });

    setUsernameSearch("");
  };

  /* OPEN CHAT */
  const openChat = async (chat) => {
    setActiveChat(chat);

    await updateDoc(doc(db, "chats", chat.id), {
      [`unread.${currentUser.uid}`]: 0
    });
  };

  /* LOAD MESSAGES REALTIME */
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [activeChat]);

  /* SEND MESSAGE */
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const otherUid = activeChat.participants.find(uid => uid !== currentUser.uid);

    await addDoc(collection(db, "chats", activeChat.id, "messages"), {
      text: newMessage,
      senderId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "chats", activeChat.id), {
      lastMessage: newMessage,
      [`unread.${otherUid}`]: (activeChat.unread?.[otherUid] || 0) + 1
    });

    setNewMessage("");
  };

  if (!authReady) return <div className="chat-wrapper">Loading chat...</div>;
  if (!currentUser) return <div className="chat-wrapper">Please login again</div>;

  return (
    <div className="chat-wrapper">

      {/* SIDEBAR */}
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

        {chatList.map(chat => {
          const otherUid = chat.participants.find(uid => uid !== currentUser.uid);

          return (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
              onClick={() => openChat(chat)}
            >
              <div className="chat-name-row">
                <span>{chat.usernames?.[otherUid] || "User"}</span>
                {chat.unread?.[currentUser.uid] > 0 && <span className="unread-dot"></span>}
              </div>

              <div className="last-message">{chat.lastMessage}</div>
            </div>
          );
        })}
      </div>

      {/* CHAT AREA */}
      <div className="chat-main">

        {activeChat ? (
          <>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.senderId === currentUser.uid ? "message own" : "message"}
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
          <div className="chat-placeholder">Select or start a conversation</div>
        )}

      </div>
    </div>
  );
}

export default Chat;