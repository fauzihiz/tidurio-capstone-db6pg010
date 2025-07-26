import { useEffect, useState } from "react";
import { fetchDashboard, logSleep} from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sleepEntry, setSleepEntry] = useState({
    date: "",
    hours: "",
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchDashboard();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load the dashboard: ", err);
      }
    };
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    try {
      await logSleep({ hours: sleepEntry.hours });
      setSleepEntry({ date: "", hours: "" }) //mereset form
      setIsModalOpen(false);
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Failed to log sleep", err);
    }
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>

      <p>Total Points: {data.totalPoints}</p>
      <p>Current Streak: {data.currentStreak} days</p>

      <Button onClick={() => setIsModalOpen(true)}>+ Add Sleep Entry</Button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <Card className="w-full max-w-md bg-zinc-900 text-white">
            <CardHeader>
              <CardTitle>Log Your Sleep</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddSleep}>
              <CardContent className="space-y-4">
                <label className="block text-sm font-medium">
                  Hours slept:
                  <Input
                    type="number"
                    min="0"
                    value={sleepEntry.hours}
                    onChange={(e) => 
                      setSleepEntry((prev) => ({ ...prev, hours: e.target.value}))
                    }
                    required
                  />
                </label>
              </CardContent>
              <CardFooter className="justify-end space-x-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
