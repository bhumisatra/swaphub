import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import {
collection, query, where, getDocs, addDoc, onSnapshot, orderBy,
serverTimestamp, setDoc, doc, updateDoc, getDoc
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/chat.css";

/* USERNAME FIX COMPONENT */
function ChatItem({ chat, currentUser, activeChat, openChat }) {
const [username, setUsername] = useState("...");

useEffect(() => {
const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
const load = async () => {
const snap = await getDoc(doc(db,"users",otherUid));
if(snap.exists()) setUsername(snap.data().username);
};
load();
}, [chat, currentUser]);

return (
<div
className={`chat-item ${activeChat?.id===chat.id?"active":""}`}
onClick={()=>openChat(chat)}
>
<div className="chat-name-row">
<span>{username}</span>
{chat.unread?.[currentUser.uid]>0 && <span className="unread-dot"/>}
</div>
</div>
);
}

function Chat() {

const navigate = useNavigate();
const { chatId: uid } = useParams();
const autoOpenedRef = useRef(false);

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
const [chatOpen, setChatOpen] = useState(false);

const [otherUserData, setOtherUserData] = useState(null);
const [showMenu, setShowMenu] = useState(false);

const [editingNickname, setEditingNickname] = useState(false);
const [nicknameInput, setNicknameInput] = useState("");

const menuRef = useRef();

useEffect(() => {
const handler = (e) => {
if (!menuRef.current) return;
if (e.target.closest(".menu-btn") || e.target.closest(".chat-menu")) return;
setShowMenu(false);
};
document.addEventListener("mousedown", handler);
return () => document.removeEventListener("mousedown", handler);
}, []);

const generateChatId = (uid1, uid2) => uid1 > uid2 ? uid1 + uid2 : uid2 + uid1;

/* CASE INSENSITIVE SEARCH */
const startChat = async () => {
if (!usernameSearch.trim() || !currentUser) return;

const search = usernameSearch.trim().toLowerCase();
const snap = await getDocs(collection(db, "users"));

const userDoc = snap.docs.find(
doc => doc.data().username?.toLowerCase() === search
);

if (!userDoc) {
alert("User not found");
return;
}

const otherUser = userDoc.data();
const otherUid = otherUser.uid;

if (otherUid === currentUser.uid) {
alert("You can't chat with yourself");
return;
}

const chatId = generateChatId(currentUser.uid, otherUid);

await setDoc(doc(db, "chats", chatId), {
participants: [currentUser.uid, otherUid],
usernames:{
[currentUser.uid]:currentUser.email,
[otherUid]:otherUser.username
},
nicknames:{},
unread:{[currentUser.uid]:0,[otherUid]:0},
lastMessage:"",
createdAt: serverTimestamp()
},{merge:true});

setUsernameSearch("");
};

const formatTime = (timestamp) => {
if (!timestamp?.seconds) return "";
const date = new Date(timestamp.seconds * 1000);
return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (timestamp) => {
if (!timestamp?.seconds) return "";
const date = new Date(timestamp.seconds * 1000);
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

if (date.toDateString() === today.toDateString()) return "Today";
if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

return date.toLocaleDateString();
};

/* LOAD CHAT LIST */
useEffect(() => {
if (!authReady || !currentUser) return;

const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));

return onSnapshot(q, snap => {
setChatList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});
}, [authReady, currentUser]);

/* OPEN CHAT */
const openChat = async (chat) => {
setShowMenu(false);

const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
const userRef = doc(db, "users", otherUid);
const snap = await getDoc(userRef);
if(snap.exists()) setOtherUserData({uid:otherUid,...snap.data()});

await updateDoc(doc(db,"chats",chat.id),{
[`unread.${currentUser.uid}`]:0
});

setActiveChat(chat);
setChatOpen(true);
};

/* LOAD MESSAGES */
useEffect(()=>{
if(!activeChat) return;
const q=query(collection(db,"chats",activeChat.id,"messages"),orderBy("createdAt","asc"));
return onSnapshot(q,snap=>setMessages(snap.docs.map(d=>({id:d.id,...d.data()}))));
},[activeChat]);

/* SEND MESSAGE */
const sendMessage = async ()=>{
if(!newMessage.trim()||!activeChat) return;
const otherUid=activeChat.participants.find(uid=>uid!==currentUser.uid);

await addDoc(collection(db,"chats",activeChat.id,"messages"),{
text:newMessage,
senderId:currentUser.uid,
createdAt:serverTimestamp()
});

await updateDoc(doc(db,"chats",activeChat.id),{
lastMessage:newMessage,
[`unread.${otherUid}`]:(activeChat.unread?.[otherUid]||0)+1
});

setNewMessage("");
};

if (!authReady) return <div className="chat-wrapper">Loading chat...</div>;
if (!currentUser) return <div className="chat-wrapper">Please login again</div>;

let lastDate = "";

return (

<div className={`chat-wrapper ${chatOpen ? "chat-open" : ""}`}>
<div className="chat-sidebar">
<div className="chat-search">
<input value={usernameSearch} onChange={e=>setUsernameSearch(e.target.value)} placeholder="Search username..."/>
<button onClick={startChat}>Start</button>
</div>

{chatList.map(chat=>(
<ChatItem
key={chat.id}
chat={chat}
currentUser={currentUser}
activeChat={activeChat}
openChat={openChat}
/>
))}
</div>

<div className="chat-main">
{activeChat?(
<>
<div className="chat-header">
<button className="mobile-back" onClick={()=>setChatOpen(false)}>←</button>
<div className="chat-user">{otherUserData?.username}</div>

<div className="chat-menu-container" ref={menuRef}>
<button className="menu-btn" onClick={(e)=>{e.stopPropagation();setShowMenu(!showMenu);}}>⋮</button>

{showMenu && (
<div className="chat-menu">
<button
className="chat-menu-btn"
onClick={()=>navigate(`/dashboard/profile/${otherUserData?.uid}`)}
>
View Profile
</button>

<button
className="chat-menu-btn secondary"
onClick={()=>setEditingNickname(true)}
>
Edit Nickname
</button>
</div>
)}

</div>
</div>

<div className="chat-messages">
{messages.map((msg,i)=>{
const dateLabel = formatDateLabel(msg.createdAt);
const showDate = dateLabel !== lastDate;
lastDate = dateLabel;

return(
<>
{showDate && <div className="date-separator">{dateLabel}</div>}
<div key={msg.id} className={msg.senderId===currentUser.uid?"message own":"message"}>
{msg.text}
<span className="message-time">{formatTime(msg.createdAt)}</span>
</div>
</>
);
})}
</div>

<div className="chat-input">
<input value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Type a message"/>
<button onClick={sendMessage}>Send</button>
</div>
</>
):(
<div className="chat-placeholder">
<img src="/no-chat.jpg" alt="start chat" className="nochat-img"/>
<h2>Start a Conversation</h2>
<p>Select a user from the left or search a username</p>
</div>
)}
</div>
</div>
);
}

export default Chat;