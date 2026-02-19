import { getDatabase, ref, onDisconnect, set, onValue } from "firebase/database";
import { auth } from "../firebase";

export function setupPresence(community) {
  const uid = auth.currentUser?.uid;
  if (!uid || !community) return;

  const rtdb = getDatabase();
  const connectedRef = ref(rtdb, ".info/connected");
  const userStatusRef = ref(rtdb, `status/${community}/${uid}`);

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {

      onDisconnect(userStatusRef).remove();

      set(userStatusRef, {
        online: true,
        lastActive: Date.now()
      });
    }
  });
}