import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const ensureGeneralGroup = async () => {

  const ref = doc(db, "communityGroups", "general");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: "General Chat",
      createdBy: "system",
      createdAt: serverTimestamp()
    });
  }

};