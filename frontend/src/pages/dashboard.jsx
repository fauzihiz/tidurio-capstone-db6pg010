import { useEffect, useState } from "react";
import { fetchDashboard } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard().then(res => setData(res.data));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Total Points: {data.totalPoints}</p>
      <p>Current Streak: {data.currentStreak} days</p>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
