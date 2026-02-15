import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function GroupsPanel({ community, selected, setSelected }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!community) return;

    const unsub = onSnapshot(
      collection(db, "communities", community, "groups"),
      (snap) => {
        setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => unsub();
  }, [community]);

  return (
    <div className="groups-panel">
      <input className="group-search" placeholder="Search groups..." />

      {groups.map(g => (
        <div
          key={g.id}
          className={`group-item ${selected === g.id ? "active" : ""}`}
          onClick={() => setSelected(g.id)}
        >
          {g.name}
        </div>
      ))}
    </div>
  );
}