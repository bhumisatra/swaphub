import { getDatabase, ref, set, onDisconnect, onValue } from "firebase/database";
import { auth } from "../firebase";

export function setupPresence(communityName) {

  const user = auth.currentUser;
  if (!user || !communityName) return;

  const rtdb = getDatabase();

  const connectedRef = ref(rtdb, ".info/connected");
  const userStatusRef = ref(rtdb, `status/${communityName}/${user.uid}`);

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {

      // when connected → mark online
      set(userStatusRef, {
        online: true,
        lastActive: Date.now()
      });

      // when disconnect → mark offline automatically
      onDisconnect(userStatusRef).set({
        online: false,
        lastActive: Date.now()
      });
    }
  });
}