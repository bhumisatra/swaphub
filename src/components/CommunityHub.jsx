import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export default function CommunityHub() {

  const { category } = useParams();

  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [newGroup, setNewGroup] = useState("");

  /* LOAD GROUPS REALTIME */
  useEffect(() => {
    if (!category) return;

    const ref = collection(db, "communities", category, "groups");

    return onSnapshot(ref, (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

  }, [category]);

  /* CREATE GROUP */
  const createGroup = async () => {
    if (!newGroup.trim()) return;

    await addDoc(collection(db, "communities", category, "groups"), {
      name: newGroup,
      createdAt: serverTimestamp()
    });

    setNewGroup("");
  };

  return (
    <div style={{display:"flex", height:"100%", color:"white"}}>

      {/* LEFT */}
      <div style={{width:260, background:"#0f172a", padding:20}}>

        <h2>{category?.toUpperCase()}</h2>

        <input
          placeholder="Create group"
          value={newGroup}
          onChange={e=>setNewGroup(e.target.value)}
        />
        <button onClick={createGroup}>Create</button>

        <div style={{marginTop:20}}>
          {groups.map(g => (
            <div
              key={g.id}
              onClick={()=>setActiveGroup(g)}
              style={{
                padding:10,
                cursor:"pointer",
                background: activeGroup?.id===g.id ? "#1e293b" : "transparent"
              }}
            >
              {g.name}
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT */}
      <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center"}}>
        {activeGroup
          ? <h3>{activeGroup.name} Chat Coming Next...</h3>
          : <h3>Select a group</h3>}
      </div>

    </div>
  );
}