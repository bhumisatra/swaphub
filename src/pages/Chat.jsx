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
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

function Chat() {

  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const navigate = useNavigate();

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

  /* LOAD CHATS */
  useEffect(() => {
    if (!authReady || !currentUser) return;

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

    // 🔥 FIXED UID FETCH
    const otherUserDoc = snap.docs[0];
    const otherUserData = otherUserDoc.data();
    const otherUid = otherUserData.uid;

    const chatId = generateChatId(currentUser.uid, otherUid);

    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [currentUser.uid, otherUid],
        usernames: {
          [currentUser.uid]: currentUser.email,
          [otherUid]: otherUserData.username,
        },
        unread: {
          [currentUser.uid]: 0,
          [otherUid]: 0,
        },
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    setUsernameSearch("");
  };

  /* OPEN CHAT */
  const openChat = async (chat) => {
    if (!currentUser) return;

    setActiveChat(chat);

    await updateDoc(doc(db, "chats", chat.id), {
      [`unread.${currentUser.uid}`]: 0,
    });
  };

  /* SAFETY RENDER */
  if (!authReady) return <div className="chat-wrapper">Loading chat...</div>;
  if (!currentUser) return <div className="chat-wrapper">Please login again</div>;

  return (
    <div className="chat-wrapper">

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
              onClick={() => openChat(chat)}
            >
              <div className="chat-name-row">
                <span>
                  {chat.usernames?.[otherUid] || "User"}
                </span>

                {chat.unread?.[currentUser.uid] > 0 && (
                  <span className="unread-dot"></span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-main">
        {activeChat ? (
          <div className="chat-placeholder">Chat opened successfully 🎉</div>
        ) : (
          <div className="chat-placeholder">Select a conversation</div>
        )}
      </div>

    </div>
  );
}

export default Chat;