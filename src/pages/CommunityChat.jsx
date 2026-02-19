import { useParams, useNavigate } from "react-router-dom";
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
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, set, onDisconnect } from "firebase/database";
import "../styles/community.css";
import { setupPresence } from "../utils/presence";

export default function Community() {
const { name } = useParams();
const navigate = useNavigate();

const [groups, setGroups] = useState([]);
const [selectedGroup, setSelectedGroup] = useState("general");
const [search, setSearch] = useState("");

const [text, setText] = useState("");
const [messages, setMessages] = useState([]);
const [loaded, setLoaded] = useState(false);

const [menuOpen, setMenuOpen] = useState(null);
const [replyTo, setReplyTo] = useState(null);
const [username, setUsername] = useState("user");

const [currentUID, setCurrentUID] = useState(null);
const [authReady, setAuthReady] = useState(false);

// ⭐ NEW STATES
const [requests, setRequests] = useState([]);
const [openRequests, setOpenRequests] = useState(false);

// 👥 ONLINE USERS STATE
const [onlineCount, setOnlineCount] = useState(0);

// 🔥 WAIT FOR AUTH FIRST
useEffect(() => {
const unsub = onAuthStateChanged(auth, async (user) => {
if (!user) return;

setCurrentUID(user.uid);

const refUser = doc(db, "users", user.uid);
const snap = await getDoc(refUser);

if (snap.exists()) {
setUsername(snap.data().username || "user");
}

setAuthReady(true);
});

return () => unsub();

}, []);


// 🔴 WRITE ONLINE STATUS (Realtime presence)
useEffect(() => {
if (!authReady || !currentUID || !name) return;

const rtdb = getDatabase();
const userStatusRef = ref(rtdb, `status/${name}/${currentUID}`);

set(userStatusRef, {
online: true,
group: selectedGroup,
lastActive: Date.now()
});

onDisconnect(userStatusRef).set({
online: false,
lastActive: Date.now()
});

}, [authReady, currentUID, name, selectedGroup]);


// 👥 REAL ONLINE USERS (Realtime DB presence)
useEffect(() => {
if (!name || !selectedGroup) return;

const rtdb = getDatabase();
const statusRef = ref(rtdb, `status/${name}`);

return onValue(statusRef, (snapshot) => {
const data = snapshot.val() || {};
let count = 0;

Object.values(data).forEach(user => {
if (user?.online === true && user?.group === selectedGroup) count++;
});

setOnlineCount(count);
});

}, [name, selectedGroup]);


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


// LOAD MESSAGES ONLY AFTER AUTH READY
useEffect(() => {
if (!name || !selectedGroup || !authReady) return;

const q = query(
collection(db, "communities", name, "groups", selectedGroup, "messages"),
orderBy("time", "asc")
);

const unsub = onSnapshot(q, (snapshot) => {
const safe = snapshot.docs
.map(doc => ({ id: doc.id, ...doc.data() }))
.filter(msg => msg.text);

setMessages(safe);
setLoaded(true);

const reqs = safe.filter(m => m.text.toLowerCase().startsWith("@request"));
setRequests(reqs);
});

return () => unsub();

}, [name, selectedGroup, authReady]);


// SEND MESSAGE
const sendMessage = async () => {
if (!text.trim()) return;

await addDoc(
collection(db, "communities", name, "groups", selectedGroup, "messages"),
{
text: text.trim(),
user: username,
uid: currentUID,
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


// TIME FORMAT
const formatTime = (timestamp) => {
if (!timestamp?.toDate) return "";
const date = timestamp.toDate();
return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};


return (
<div className="community-wrapper">

{requests.length > 0 && (
<div className="request-float" onClick={() => setOpenRequests(true)}>
{requests.length}
</div>
)}

{openRequests && (
<div className="request-panel">
<div className="request-header">
Requests
<span onClick={() => setOpenRequests(false)}>✕</span>
</div>

<div className="request-list">
{requests.map(r => (
<div key={r.id} className="request-item">
<div className="req-user">{r.user}</div>
<div className="req-text">{r.text.replace("@request", "")}</div>
</div>
))}
</div>
</div>
)}

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
{groups.map(g => (
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

<div className="community-header">
<div className="online-indicator">
<span className="online-count">{onlineCount}</span>
<span className={`online-dot ${onlineCount > 0 ? "active" : ""}`}></span>
</div>

<h1 className="community-title">{name.toUpperCase()} COMMUNITY</h1>
</div>

<div className="messages-box">
{!authReady && <p>Connecting...</p>}

{authReady && messages.map(msg => {
const isMe = msg.uid === currentUID;

return (
<div key={msg.id} className={`message-row ${isMe ? "me" : "other"}`}>
<div className="bubble">

{msg.reply && <div className="reply-preview">{msg.reply}</div>}

<div className="msg-text">{msg.text}</div>
<div className="msg-user">{msg.user}</div>
<div className="msg-time">{formatTime(msg.time)}</div>

<div
className="msg-menu-btn"
onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)}
>
▾
</div>

{menuOpen === msg.id && (
<div className="msg-menu">
<div onClick={() => navigate(`/dashboard/profile/${msg.uid}`)}>View Profile</div>
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