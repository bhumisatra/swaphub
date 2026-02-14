import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase auth listener (One-Time Login System)
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

        {/* Login Page */}
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

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        {/* Requests Page */}
        <Route
          path="/requests"
          element={user ? <Requests /> : <Navigate to="/" />}
        />

        {/* Chat Page */}
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;