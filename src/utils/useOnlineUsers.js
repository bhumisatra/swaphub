import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

export default function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const statusRef = ref(db, "status");

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {};
      const online = [];

      Object.entries(data).forEach(([uid, info]) => {
        if (info?.online === true) {
          online.push(uid);
        }
      });

      setOnlineUsers(online);
    });

    return () => unsubscribe();
  }, []);

  return onlineUsers;
}