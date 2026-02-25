import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import {
collection, query, where, getDocs, addDoc, onSnapshot, orderBy,
serverTimestamp, setDoc, doc, updateDoc, getDoc, arrayUnion
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/chat.css";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";


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
const { chatid: chatId } = useParams();
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
const [tempOffer,setTempOffer] = useState({});

const [otherUserData, setOtherUserData] = useState(null);
const [showMenu, setShowMenu] = useState(false);

const [editingNickname, setEditingNickname] = useState(false);
const [nicknameInput, setNicknameInput] = useState("");



/* 🔥 NEW SWAP STATE */
const [swaps, setSwaps] = useState([]);
const menuRef = useRef();
const bottomRef = useRef(null);
useEffect(() => {
bottomRef.current?.scrollIntoView({ behavior: "instant" });
}, [messages, swaps, activeChat]);

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

/* 🔥 LOAD SWAPS FOR ACTIVE CHAT */
useEffect(() => {
  if (!activeChat) return;

  const q = query(
    collection(db, "swaps"),
    where("chatId", "==", activeChat.id),
    orderBy("createdAt", "asc")
  );

  const unsub = onSnapshot(q, (snap) => {
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setSwaps(data);
  });

  return () => unsub();
}, [activeChat]);
/* 🔥 CREATE SWAP */
const createSwap = async () => {
  if (!activeChat || !currentUser || !otherUserData) return;

  await addDoc(collection(db, "swaps"), {
    chatId: activeChat.id,

    users: [currentUser.uid, otherUserData.uid],
    proposer: currentUser.uid,
    receiver: otherUserData.uid,

    offerA: "",
    offerB: "",

    acceptedBy: [],
    completedBy: [],
    rejectedBy: null,

    status: "editing",

    createdAt: serverTimestamp()
  });
};

useEffect(() => {
if (!chatId || !currentUser || autoOpenedRef.current) return;

let chat = chatList.find(c => c.id === chatId);

if (!chat) {
chat = chatList.find(c =>
c.participants.includes(chatId) &&
c.participants.includes(currentUser.uid)
);
}

if (chat) {
autoOpenedRef.current = true;
openChat(chat);
}

}, [chatId, chatList, currentUser]);

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
// 🔥 COMBINE SWAPS + MESSAGES INTO ONE TIMELINE
const timeline = [
  ...messages.map(m => ({ ...m, type: "message" })),
  ...swaps.map(s => ({ ...s, type: "swap" }))
].sort((a, b) => {
  const t1 = a.createdAt?.seconds || 0;
  const t2 = b.createdAt?.seconds || 0;
  return t1 - t2;
});


const acceptSwap = async (item) => {

const swapRef = doc(db, "swaps", item.id);

// prevent double accept
if(item.acceptedBy?.includes(currentUser.uid)) return;

// add current user
await updateDoc(swapRef,{
acceptedBy: arrayUnion(currentUser.uid)
});

// read updated swap
const updated = await getDoc(swapRef);
const data = updated.data();

// if both accepted → finalize
if(data.acceptedBy?.length === 2){
await updateDoc(swapRef,{
status:"accepted"
});
}else{
await updateDoc(swapRef,{
status:"pending"
});
}
};

const completeSwap = async (item) => {

  const swapRef = doc(db, "swaps", item.id);

  // already pressed
  if(item.completedBy?.includes(currentUser.uid)) return;

  // add current user
  await updateDoc(swapRef,{
    completedBy: arrayUnion(currentUser.uid)
  });

  // check if both completed
  const updated = await getDoc(swapRef);
  const data = updated.data();

  if(data.completedBy?.length === 2){
    await updateDoc(swapRef,{
      status:"completed"
    });
  }
};

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

{timeline.map((item) => {

  // ===== SWAP CARD =====
if (item.type === "swap") {

  const isMeProposer = item.proposer === currentUser.uid;
  const isMeReceiver = item.receiver === currentUser.uid;

  const canEditMyOffer =
    (isMeProposer && !item.offerA) ||
    (isMeReceiver && !item.offerB);

  const myOfferField = isMeProposer ? "offerA" : "offerB";

  return (
    <div key={item.id} className="swap-card">

      <div className="swap-title">🤝 Service Swap Request</div>

      <div className="swap-line">
        <b>You offer:</b>

        {canEditMyOffer ? (
          <div className="swap-input-row">

  <input
    className="swap-input"
    placeholder="Type your service..."
    value={tempOffer[item.id] || ""}
    onChange={(e)=>{
      setTempOffer(prev=>({...prev,[item.id]:e.target.value}));
    }}
  />

  <button
    className="swap-send"
    onClick={async()=>{
  const text = tempOffer[item.id];
  if(!text?.trim()) return;

  const ref = doc(db,"swaps",item.id);

  // update my offer
  await updateDoc(ref,{
    [myOfferField]: text,
  });

  // re-read swap
  const snap = await getDoc(ref);
  const data = snap.data();

  // if both offers written → make pending
  if(data.offerA && data.offerB){
    await updateDoc(ref,{
      status:"pending"
    });
  }

  setTempOffer(prev=>({...prev,[item.id]:""}));
}}
  >
    ✔
  </button>

</div>
        ) : (
          <span>{isMeProposer ? item.offerA : item.offerB}</span>
        )}
      </div>

      <div className="swap-line">
        <b>They offer:</b>
        <span>{isMeProposer ? item.offerB : item.offerA}</span>
      </div>

      {item.offerA && item.offerB && item.status === "pending" && (
        <div className="swap-actions">

          <button
className="accept-btn"
onClick={()=>acceptSwap(item)}
>
Accept
</button>

          <button
className="reject-btn"
onClick={async()=>{
await updateDoc(doc(db,"swaps",item.id),{
rejectedBy:currentUser.uid,
status:"rejected"
});
}}
>
Reject
</button>
        </div>
      )}

      <div className={`swap-status ${item.status}`}>
        {item.status==="editing" && "Write your services"}
        {item.status==="pending" && "Waiting for other user"}
        {item.status==="accepted" && "🟢 Work in Progress"}
{item.status==="completed" && "🎉 Swap Completed"}
{item.status==="rejected" && "❌ Swap Cancelled"}
        {item.status === "accepted" && (
  <div className="swap-actions">

    <button
      className="complete-btn"
      onClick={()=>completeSwap(item)}
    >
      Completed
    </button>

  </div>
)}
      </div>

    </div>
  );
}

  // ===== NORMAL MESSAGE =====
  const dateLabel = formatDateLabel(item.createdAt);
  const showDate = dateLabel !== lastDate;
  lastDate = dateLabel;

 // ===== NORMAL MESSAGE =====
return (
  <>
    {showDate && <div className="date-separator">{dateLabel}</div>}

    <div className={item.senderId===currentUser.uid?"message own":"message"}>

      {/* TEXT MESSAGE */}
      {item.text && <div className="msg-text">{item.text}</div>}

      {/* IMAGE */}
      {item.fileUrl && item.fileType?.startsWith("image") && (
        <img src={item.fileUrl} className="chat-image" />
      )}

      {/* VIDEO */}
      {item.fileUrl && item.fileType?.startsWith("video") && (
        <video controls className="chat-video">
          <source src={item.fileUrl} type={item.fileType} />
        </video>
      )}

  {/* DOCUMENT */}
{item.fileUrl && !item.fileType?.startsWith("image") && !item.fileType?.startsWith("video") && (
  <a
    href={item.fileUrl.replace("/upload/", "/upload/fl_attachment/")}
    className="chat-file"
  >
    ⬇ Download {item.fileName || "file"}
  </a>
)}

      <span className="message-time">{formatTime(item.createdAt)}</span>

    </div>
  </>
);
})}

<div ref={bottomRef}></div>
</div>


<div className="chat-input">

  {/* ATTACH BUTTON */}
  <label className="attach-btn">
    📎
    <input
      type="file"
      hidden
      onChange={async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChat) return;

        const url = await uploadToCloudinary(file);

        await addDoc(collection(db,"chats",activeChat.id,"messages"),{
          fileUrl: url,
          fileName: file.name,
          fileType: file.type,
          senderId: currentUser.uid,
          createdAt: serverTimestamp()
        });
      }}
    />
  </label>

  {/* TEXT INPUT */}
  <input
    value={newMessage}
    onChange={e=>setNewMessage(e.target.value)}
    onKeyDown={e=>e.key==="Enter"&&sendMessage()}
    placeholder="Type a message"
  />

  {/* SEND */}
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
{/* FLOATING SWAP BUTTON */}
{activeChat && (
<button className="floating-swap-btn" onClick={createSwap}>
🤝
</button>
)}
</div>
);
}

export default Chat;