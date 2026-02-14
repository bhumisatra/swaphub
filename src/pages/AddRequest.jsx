import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";

function AddRequest() {

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "requests"), {
      title: e.target.title.value,
      description: e.target.description.value,
      location: e.target.location.value,
      userId: auth.currentUser.uid,
      email: auth.currentUser.email,
      createdAt: new Date()
    });

    alert("Request Added!");
  };

  return (
    <>
      <Navbar />
      <form className="form" onSubmit={handleSubmit}>
        <input name="title" placeholder="Service Title" required />
        <textarea name="description" placeholder="Description" required />
        <input name="location" placeholder="City" required />
        <button>Post Request</button>
      </form>
    </>
  );
}

export default AddRequest;
