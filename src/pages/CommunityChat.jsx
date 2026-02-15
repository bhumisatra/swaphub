import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import "../styles/community.css";

export default function Community() {
const { name } = useParams();

const [groups, setGroups] = useState([]);
const [selectedGroup, setSelectedGroup] = useState("general");
const [search, setSearch] = useState("");

const [text, setText] = useState("");
const [messages, setMessages] = useState([]);
const [loaded, setLoaded] = useState(false);

const [menuOpen, setMenuOpen] = useState(null);
const [replyTo, setReplyTo] = useState(null);
const [username, setUsername] = useState("user");

// LOAD USERNAME FROM USERS COLLECTION
useEffect(() => {
  const loadUser = async () => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setUsername(snap.data().name || "user");
    }
  };

  loadUser();
}, []);


// LOAD GROUPS
useEffect(() => {
if (!name) return;

const groupsRef = collection(db, "communities", name, "groups");

const unsub = onSnapshot(groupsRef, (snap) => {
  let list = snap.docs.map(d => d.id);
  if (!list.includes("general")) list.unshift("general");
  setGroups(list);
});

return () => unsub();
}, [name]);

// LOAD MESSAGES
useEffect(() => {
if (!name || !selectedGroup) return;

const q = query(
  collection(db, "communities", name, "groups", selectedGroup, "messages"),
  orderBy("time", "asc")
);

const unsub = onSnapshot(q, (snapshot) => {
  const safe = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(msg => msg.text && msg.user);

  setMessages(safe);
  setLoaded(true);
});

return () => unsub();
}, [name, selectedGroup]);

// SEND MESSAGE
const sendMessage = async () => {
if (!text.trim()) return;

await addDoc(
  collection(db, "communities", name, "groups", selectedGroup, "messages"),
  {
    text: text.trim(),
    user: username,
    reply: replyTo ? replyTo.text : null,
    time: serverTimestamp()
  }
);

setText("");
setReplyTo(null);
};

const handleKey = (e) => {
if (e.key === "Enter") sendMessage();
};

// CREATE GROUP
const createGroup = async () => {
const g = prompt("Enter group name");
if (!g) return;

await setDoc(doc(db, "communities", name, "groups", g.toLowerCase()), {
  createdAt: serverTimestamp()
});
};

// SEARCH SORT
const filteredGroups = [...groups].sort((a, b) => {
if (!search) return 0;
if (a.includes(search.toLowerCase())) return -1;
if (b.includes(search.toLowerCase())) return 1;
return 0;
});

// TIME FORMAT
const formatTime = (timestamp) => {
if (!timestamp?.toDate) return "";
const date = timestamp.toDate();
return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

return (
<div className="community-wrapper">

  <div className="groups-panel">
    <div className="group-search">
      <input
        placeholder="Search or create group..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={createGroup}>+</button>
    </div>

    <div className="group-list">
      {filteredGroups.map(g => (
        <div
          key={g}
          className={`group-item ${g === selectedGroup ? "active" : ""}`}
          onClick={() => setSelectedGroup(g)}
        >
          #{g}
        </div>
      ))}
    </div>
  </div>

  <div className="chat-panel">

    <h1 className="community-title">{name.toUpperCase()} COMMUNITY</h1>

    <div className="messages-box">
      {!loaded && <p>Connecting...</p>}

      {messages.map(msg => {
        const isMe = msg.user === username;

        return (
          <div key={msg.id} className={`message-row ${isMe ? "me" : "other"}`}>
            <div className="bubble">

              {msg.reply && (
                <div className="reply-preview">{msg.reply}</div>
              )}

              <div className="msg-text">{msg.text}</div>

              <div className="msg-user">{msg.user}</div>

              <div className="msg-time">{formatTime(msg.time)}</div>

              {/* HOVER MENU BUTTON */}
              <div
                className="msg-menu-btn"
                onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)}
              >
                ▾
              </div>

              {menuOpen === msg.id && (
                <div className="msg-menu">
                  <div onClick={() => alert("Open profile of " + msg.user)}>View Profile</div>
                  <div onClick={() => { setReplyTo(msg); setMenuOpen(null); }}>Reply</div>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>

    {replyTo && (
      <div className="reply-bar">
        Replying to: {replyTo.text}
        <span onClick={() => setReplyTo(null)}>✕</span>
      </div>
    )}

    <div className="send-box">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={`Message #${selectedGroup}`}
      />
      <button onClick={sendMessage}>Send</button>
    </div>

  </div>
</div>
);
}