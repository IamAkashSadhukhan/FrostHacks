import { useNavigate } from "react-router-dom";
import { logout } from "../api/api";
import { useEffect, useState } from "react";

const Navbar = () => {

  const navigate = useNavigate();
  const [role, setRole] = useState("");

  // 🔥 Decode role from token (simple way)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role); // assuming you store role in JWT
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleLogout = () => {
    logout(); // 🔥 remove token + redirect
  };

  return (
    <div className="w-full bg-white shadow p-4 flex justify-between items-center">

      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-bold cursor-pointer"
      >
        AI Classroom
      </h1>

      <div className="space-x-4 flex items-center">

        {/* Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-700 hover:text-black"
        >
          Dashboard
        </button>

        {/* 🔥 Role-based UI */}
        {role === "TEACHER" && (
          <button
            onClick={() => navigate("/create-classroom")}
            className="text-blue-600 hover:underline"
          >
            Create Classroom
          </button>
        )}

        {role === "STUDENT" && (
          <button
            onClick={() => navigate("/join-classroom")}
            className="text-green-600 hover:underline"
          >
            Join Classroom
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Navbar;