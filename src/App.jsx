import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setupPresence } from "./utils/presence";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Requests from "./pages/Requests";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import ViewProfile from "./pages/ViewProfile";
import EditProfile from "./pages/EditProfile";
import Community from "./pages/CommunityChat";
import CommunityHub from "./components/CommunityHub";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopPresence = null;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // ⭐ START PRESENCE ONLY WHEN USER EXISTS
      if (currentUser) {
        stopPresence = setupPresence(currentUser.uid);
      }

      // ⭐ STOP PRESENCE WHEN LOGOUT
      if (!currentUser && stopPresence) {
        stopPresence();
      }
    });

    return () => {
      unsubscribe();
      if (stopPresence) stopPresence();
    };
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/profile-setup" element={user ? <ProfileSetup /> : <Navigate to="/" />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* DEFAULT HOME */}
          <Route index element={<Home />} />

          {/* PROFILE */}
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="profile/:uid" element={<ViewProfile />} />

          {/* COMMUNITY */}
          <Route path="community/:name" element={<Community />} />
          <Route path="communities/:category" element={<CommunityHub />} />

          {/* CHAT */}
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:uid" element={<Chat />} />

          {/* OTHER FEATURES */}
          <Route path="requests" element={<Requests />} />
          <Route path="settings" element={<Settings />} />

        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;