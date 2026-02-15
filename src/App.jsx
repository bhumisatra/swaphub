import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import EditProfile from "./pages/EditProfile";   // ⭐ ADDED
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <Signup />}
        />

        {/* Profile Setup */}
        <Route
          path="/profile-setup"
          element={user ? <ProfileSetup /> : <Navigate to="/" />}
        />

        {/* 🔥 PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />

          {/* PROFILE FLOW */}
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} /> {/* ⭐ THIS FIXES YOUR ISSUE */}
          <Route path="profile/:uid" element={<ViewProfile />} />

          {/* OTHER PAGES */}
          <Route path="chat" element={<Chat />} />
          <Route path="requests" element={<Requests />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Unknown */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;