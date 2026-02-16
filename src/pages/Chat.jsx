import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import {
collection, query, where, getDocs, addDoc, onSnapshot, orderBy,
serverTimestamp, setDoc, doc, updateDoc, getDoc
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/chat.css";

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
const handler = e => {
if(menuRef.current && !menuRef.current.contains(e.target)){
setShowMenu(false);
}
};
document.addEventListener("mousedown", handler);
return () => document.removeEventListener("mousedown", handler);
}, []);

const generateChatId = (uid1, uid2) => uid1 > uid2 ? uid1 + uid2 : uid2 + uid1;

/* TIME FORMATTER */
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

/* AUTO OPEN CHAT FROM PROFILE */
useEffect(() => {

if (!uid || !currentUser || !authReady) return;
if (autoOpenedRef.current) return;

const openDirectChat = async () => {

const chatId = generateChatId(currentUser.uid, uid);
let existing = chatList.find(c => c.id === chatId);

if (existing) {
openChat(existing);
autoOpenedRef.current = true;
return;
}

const userRef = doc(db, "users", uid);
const snap = await getDoc(userRef);
if (!snap.exists()) return;

const otherUser = snap.data();

await setDoc(doc(db, "chats", chatId), {
participants: [currentUser.uid, uid],
usernames: {
[currentUser.uid]: currentUser.email,
[uid]: otherUser.username
},
nicknames: {},
unread: {
[currentUser.uid]: 0,
[uid]: 0
},
lastMessage: "",
createdAt: serverTimestamp()
},{merge:true});

setTimeout(() => {
openChat({
id: chatId,
participants:[currentUser.uid, uid],
usernames:{
[currentUser.uid]:currentUser.email,
[uid]:otherUser.username
},
nicknames:{},
unread:{[currentUser.uid]:0,[uid]:0}
});
autoOpenedRef.current = true;
},400);
};

openDirectChat();

}, [uid, currentUser, authReady, chatList]);

/* ACTIVE CHAT REALTIME */
useEffect(()=>{
if(!activeChat) return;
const ref = doc(db,"chats",activeChat.id);
return onSnapshot(ref,snap=>setActiveChat({ id:snap.id, ...snap.data() }));
},[activeChat?.id]);

/* OPEN CHAT */
const openChat = async (chat) => {
setShowMenu(false);

const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
const userRef = doc(db, "users", otherUid);
const snap = await getDoc(userRef);
if(snap.exists()) setOtherUserData(snap.data());

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

/* VIEW PROFILE */
const openProfile = ()=>{
const otherUid=activeChat.participants.find(uid=>uid!==currentUser.uid);
navigate("/dashboard/profile/"+otherUid);
};

if (!authReady) return <div className="chat-wrapper">Loading chat...</div>;
if (!currentUser) return <div className="chat-wrapper">Please login again</div>;

let lastDate = "";

return (
<div className={`chat-wrapper ${chatOpen ? "chat-open" : ""}`}>

<div className="chat-sidebar">
<div className="chat-search">
<input value={usernameSearch} onChange={e=>setUsernameSearch(e.target.value)} placeholder="Search username..."/>
<button>Start</button>
</div>

{chatList.map(chat=>{
const otherUid=chat.participants.find(uid=>uid!==currentUser.uid);
return(
<div key={chat.id} className={`chat-item ${activeChat?.id===chat.id?"active":""}`} onClick={()=>openChat(chat)}>
<div className="chat-name-row">
<span>{chat.usernames?.[otherUid]}</span>
{chat.unread?.[currentUser.uid]>0 && <span className="unread-dot"/>}
</div>
</div>
);
})}
</div>

<div className="chat-main">
{activeChat?(
<>
<div className="chat-header">
<button className="mobile-back" onClick={()=>setChatOpen(false)}>←</button>
<div className="chat-user">{otherUserData?.username}</div>
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
):<div className="chat-placeholder">Select or start a conversation</div>}
</div>

</div>
);
}

export default Chat;