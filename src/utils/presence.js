import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase";
import { auth } from "../firebase";

export const setupPresence = () => {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;
  const userStatusRef = ref(rtdb, "status/" + uid);

  // When connected -> online
  set(userStatusRef, {
    online: true,
    lastSeen: serverTimestamp()
  });

  // When disconnected -> offline automatically
  onDisconnect(userStatusRef).set({
    online: false,
    lastSeen: serverTimestamp()
  });
};