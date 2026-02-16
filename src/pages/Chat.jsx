import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, serverTimestamp, setDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

function Chat() {

const navigate = useNavigate();

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

/* LOAD CHAT LIST */
useEffect(() => {
if (!authReady || !currentUser) return;

const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));

return onSnapshot(q, snap => {
setChatList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});
}, [authReady, currentUser]);

/* ACTIVE CHAT REALTIME */
useEffect(()=>{
if(!activeChat) return;
const ref = doc(db,"chats",activeChat.id);
return onSnapshot(ref,snap=>setActiveChat({ id:snap.id, ...snap.data() }));
},[activeChat?.id]);

/* START CHAT */
const startChat = async () => {
if (!usernameSearch || !currentUser) return;

const q = query(collection(db, "users"), where("username", "==", usernameSearch));
const snap = await getDocs(q);
if (snap.empty) return alert("User not found");

const otherUser = snap.docs[0].data();
const otherUid = otherUser.uid;
const chatId = generateChatId(currentUser.uid, otherUid);

await setDoc(doc(db, "chats", chatId), {
participants: [currentUser.uid, otherUid],
usernames: {[currentUser.uid]: currentUser.email,[otherUid]: otherUser.username},
nicknames:{},
unread:{[currentUser.uid]:0,[otherUid]:0},
lastMessage:"",
createdAt: serverTimestamp()
},{merge:true});

setUsernameSearch("");
};

/* OPEN CHAT */
const openChat = async (chat) => {
setShowMenu(false);

const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
const userRef = doc(db, "users", otherUid);
const snap = await getDoc(userRef);
if(snap.exists()) setOtherUserData(snap.data());

await updateDoc(doc(db,"chats",chat.id),{[`unread.${currentUser.uid}`]:0});
setActiveChat(chat);
setChatOpen(true);
};

/* LOAD MESSAGES */
useEffect(()=>{
if(!activeChat) return;
const q=query(collection(db,"chats",activeChat.id,"messages"),orderBy("createdAt","asc"));
return onSnapshot(q,snap=>setMessages(snap.docs.map(d=>d.data())));
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

/* SAVE NICKNAME INLINE */
const saveNickname = async ()=>{
if(!nicknameInput.trim()) return setEditingNickname(false);

await updateDoc(doc(db,"chats",activeChat.id),{
[`nicknames.${currentUser.uid}`]:nicknameInput
});

setEditingNickname(false);
};

/* HEADER NAME */
const displayName = ()=>{
if(!activeChat) return "";
return activeChat.nicknames?.[currentUser.uid] || otherUserData?.username || "User";
};

/* VIEW PROFILE */
const openProfile = ()=>{
const otherUid=activeChat.participants.find(uid=>uid!==currentUser.uid);
navigate("/dashboard/profile/"+otherUid);
};

if (!authReady) return <div className="chat-wrapper">Loading chat...</div>;
if (!currentUser) return <div className="chat-wrapper">Please login again</div>;

return (
<div className={`chat-wrapper ${chatOpen ? "chat-open" : ""}`}>

<div className="chat-sidebar">
<div className="chat-search">
<input value={usernameSearch} onChange={e=>setUsernameSearch(e.target.value)} placeholder="Search username..."/>
<button onClick={startChat}>Start</button>
</div>

{chatList.map(chat=>{
const otherUid=chat.participants.find(uid=>uid!==currentUser.uid);
return(
<div key={chat.id} className={`chat-item ${activeChat?.id===chat.id?"active":""}`} onClick={()=>openChat(chat)}>
<div className="chat-name-row">
<span>{chat.usernames?.[otherUid]}</span>
{chat.unread?.[currentUser.uid]>0 && <span className="unread-dot"/>}
</div>
<div className="last-message">{chat.lastMessage}</div>
</div>
);
})}
</div>

<div className="chat-main">
{activeChat?(
<>
<div className="chat-header">

<button className="mobile-back" onClick={()=>setChatOpen(false)}>←</button>

<div className="chat-user">
{editingNickname ? (
<input className="nickname-edit-input" value={nicknameInput} autoFocus onChange={e=>setNicknameInput(e.target.value)} onBlur={saveNickname} onKeyDown={e=>e.key==="Enter" && saveNickname()}/>
) : (
displayName()
)}
</div>

<div className="chat-menu" ref={menuRef}>
<button className="menu-btn" onClick={()=>setShowMenu(!showMenu)}>⋮</button>
{showMenu&&(
<div className="menu-dropdown">
<div className="menu-item" onClick={()=>{setNicknameInput(displayName());setEditingNickname(true);setShowMenu(false);}}>Edit nickname</div>
<div className="menu-item" onClick={openProfile}>View profile</div>
</div>
)}
</div>

</div>

<div className="chat-messages">
{messages.map((msg,i)=>(
<div key={i} className={msg.senderId===currentUser.uid?"message own":"message"}>{msg.text}</div>
))}
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