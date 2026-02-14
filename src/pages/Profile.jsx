import { auth } from "../firebase";
import Navbar from "../components/Navbar";

function Profile() {
  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Profile</h2>
        <p>Email: {auth.currentUser.email}</p>
        <p>User ID: {auth.currentUser.uid}</p>
      </div>
    </>
  );
}

export default Profile;
