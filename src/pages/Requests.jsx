import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Requests() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "requests"),
      (snapshot) => {
        setRequests(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );
    return () => unsubscribe();
  }, []);

  const acceptRequest = async (request) => {
    const chatId =
      auth.currentUser.uid > request.userId
        ? auth.currentUser.uid + request.userId
        : request.userId + auth.currentUser.uid;

    // Mark request as accepted
    await updateDoc(doc(db, "requests", request.id), {
      acceptedBy: auth.currentUser.uid,
      chatId: chatId
    });

    navigate(`/chat/${chatId}`);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Service Requests</h2>

        {requests.map((req) => (
          <div key={req.id} className="card">
            <h3>{req.title}</h3>
            <p>{req.description}</p>
            <p>Location: {req.location}</p>
            <p>Posted by: {req.email}</p>

            {req.userId !== auth.currentUser.uid && !req.acceptedBy && (
              <button onClick={() => acceptRequest(req)}>
                Accept & Chat
              </button>
            )}

            {req.acceptedBy && <p>Already Accepted</p>}
          </div>
        ))}
      </div>
    </>
  );
}

export default Requests;
