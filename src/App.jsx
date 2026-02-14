import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Protect private routes
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />

        {/* Profile Setup After Signup */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* Dashboard After Login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* If wrong route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
