import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import "../styles/groups.css";

export default function GroupsPanel({ community, selected, setSelected }) {

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!community) return;

    const unsub = onSnapshot(
      collection(db, "communities", community, "groups"),
      (snap) => {
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setGroups(list);
      }
    );

    return () => unsub();
  }, [community]);

  const createGroup = async () => {
    const name = prompt("Enter group name");
    if (!name) return;

    await setDoc(doc(db, "communities", community, "groups", name.toLowerCase()), {
      name
    });
  };

  return (
    <div className="groups-panel">

      <div className="groups-header">
        <h3>Groups</h3>
        <button onClick={createGroup}>+</button>
      </div>

      <div className="groups-list">
        {groups.map(g => (
          <div
            key={g.id}
            className={`group-item ${selected === g.id ? "active" : ""}`}
            onClick={() => setSelected(g.id)}
          >
            # {g.name || g.id}
          </div>
        ))}
      </div>

    </div>
  );
}