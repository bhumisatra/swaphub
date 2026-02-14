import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Requests from "./pages/Requests";
import Chat from "./pages/Chat";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/chat/:id" element={<Chat />} />
    </Routes>
  );
}

export default App;