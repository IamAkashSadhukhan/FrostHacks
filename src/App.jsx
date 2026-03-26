import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import Classroom from "./pages/Classroom";
import Register from "./components/Register";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

function App() {
  const loadUser = useAuthStore((state) => state.loadUserFromStorage);

  useEffect(() => {
    loadUser();
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* <Route path="/classroom" element={<Classroom />} /> */}
      <Route path="/classroom/:id" element={<Classroom />} />
    </Routes>
  );
}

export default App;
