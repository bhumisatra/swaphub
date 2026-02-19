import { getDatabase, ref, onDisconnect, set, onValue } from "firebase/database";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function setupPresence(community) {

  const rtdb = getDatabase();

  onAuthStateChanged(auth, (user) => {
    if (!user || !community) return;

    const uid = user.uid;

    const connectedRef = ref(rtdb, ".info/connected");
    const userStatusRef = ref(rtdb, `status/${community}/${uid}`);

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {

        // mark offline when tab closes
        onDisconnect(userStatusRef).remove();

        // mark online
        set(userStatusRef, {
          online: true,
          lastActive: Date.now()
        });
      }
    });
  });
}