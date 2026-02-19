import { rtdb } from "../firebase";
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { auth } from "../firebase";

export const setupPresence = (communityId) => {
  const user = auth.currentUser;
  if (!user || !communityId) return;

  const statusRef = ref(rtdb, `status/${communityId}/${user.uid}`);

  // Set online
  set(statusRef, {
    online: true,
    lastChanged: serverTimestamp(),
  });

  // When user disconnects
  onDisconnect(statusRef).set({
    online: false,
    lastChanged: serverTimestamp(),
  });
};