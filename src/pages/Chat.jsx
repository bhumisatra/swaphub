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
  getDoc
} from "firebase/firestore";
import "../styles/chat.css";

function Chat() {
  const currentUser = auth.currentUser;

  const [usernameSearch, setUsernameSearch] = useState("");
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [otherUserData, setOtherUserData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nickname, setNickname] = useState("");

  const generateChatId = (uid1, uid2) => {
    return uid1 > uid2 ? uid1 + uid2 : uid2 + uid1;
  };

  // ================= LOAD CHATS =================
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

  // ================= START CHAT =================
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

    await setDoc(
      doc(db, "chats", chatId),
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

  // ================= LOAD OTHER USER DATA =================
  useEffect(() => {
    if (!activeChat) return;

    const otherUid = activeChat.participants.find(
      (uid) => uid !== currentUser.uid
    );

    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", otherUid));
      if (snap.exists()) {
        setOtherUserData(snap.data());
        setNickname(snap.data().nickname || snap.data().username);
      }
    };

    fetchUser();
  }, [activeChat]);

  // ================= LOAD MESSAGES =================
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, [activeChat]);

  // ================= SEND MESSAGE =================
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

  // ================= SAVE NICKNAME =================
  const saveNickname = async () => {
    const otherUid = activeChat.participants.find(
      (uid) => uid !== currentUser.uid
    );

    await updateDoc(doc(db, "users", otherUid), {
      nickname: nickname,
    });

    setEditingName(false);
  };

  // ================= FORMAT TIME =================
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================= FORMAT DATE =================
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString())
      return "Today";

    if (date.toDateString() === yesterday.toDateString())
      return "Yesterday";

    return date.toLocaleDateString();
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
              <div className="last-message">
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
            {/* HEADER */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {otherUserData?.username?.charAt(0).toUpperCase()}
                </div>

                {editingName ? (
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onBlur={saveNickname}
                    autoFocus
                  />
                ) : (
                  <span className="chat-username">
                    {nickname}
                  </span>
                )}
              </div>

              <div className="chat-menu">
                <button onClick={() => setShowMenu(!showMenu)}>⋮</button>

                {showMenu && (
                  <div className="dropdown-menu">
                    <div
                      onClick={() => {
                        setEditingName(true);
                        setShowMenu(false);
                      }}
                    >
                      Edit Name
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGES */}
            <div className="chat-messages">
              {messages.map((msg, index) => {
                const showDate =
                  index === 0 ||
                  formatDate(msg.createdAt) !==
                    formatDate(messages[index - 1]?.createdAt);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="date-separator">
                        {formatDate(msg.createdAt)}
                      </div>
                    )}

                    <div
                      className={
                        msg.senderId === currentUser.uid
                          ? "message own"
                          : "message"
                      }
                    >
                      <span>{msg.text}</span>
                      <span className="message-time">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage()
                }
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;