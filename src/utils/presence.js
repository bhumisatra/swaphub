import { getDatabase, ref, set, onDisconnect, onValue } from "firebase/database";
import { auth } from "../firebase";

export function setupPresence(community) {
  const rtdb = getDatabase();
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const connectedRef = ref(rtdb, ".info/connected");
  const userStatusRef = ref(rtdb, `status/${community}/${uid}`);

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {

      onDisconnect(userStatusRef).set({
        online: false,
        lastActive: Date.now()
      });

      set(userStatusRef, {
        online: true,
        lastActive: Date.now()
      });
    }
  });
}