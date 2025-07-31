// src/pages/dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchDashboard, startSleep, endSleep } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { userId, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSleepLogId, setCurrentSleepLogId] = useState(() => {
    return localStorage.getItem('currentSleepLogId') || null;
  });

  console.log('Dashboard - userId:', userId);
  console.log('Dashboard - user:', user);
  console.log('Dashboard - isAuthenticated:', isAuthenticated);
  console.log('Dashboard - dashboardData:', dashboardData);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !userId) {
      console.log('Dashboard - Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, userId, navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) {
        console.log('No userId found, skipping dashboard load');
        setLoading(false);
        return;
      }
      
      console.log('Loading dashboard for userId:', userId);
      
      try {
        const res = await fetchDashboard();
        console.log('Full Dashboard API Response:', res);
        console.log('Dashboard API Response Data:', res.data);
        console.log('Dashboard API Response Data.data:', res.data.data);
        
        // Pastikan res.data.data ada dan merupakan objek. Jika tidak ada, set ke objek kosong atau nilai default
        setDashboardData(res.data.data || {});
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        console.error("Error response:", err.response);
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);
        setError(err.response?.data?.message || "Gagal memuat data dashboard. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  const refreshDashboardData = useCallback(async () => {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboard();
      console.log('Refresh Dashboard API Response:', res.data); // Debug log
      setDashboardData(res.data.data || {});
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
      setError(err.response?.data?.message || "Gagal me-refresh data dashboard.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('currentSleepLogId');
    setCurrentSleepLogId(null);
    navigate("/login");
  };

  const handleStartSleep = async () => {
    try {
      const response = await startSleep();
      console.log('Start Sleep Response:', response); // Debug log
      
      // Fix: Akses sleepLogId dari response.data.data.sleepLogId
      if (response && response.data && response.data.data && response.data.data.sleepLogId) {
        setCurrentSleepLogId(response.data.data.sleepLogId);
        localStorage.setItem('currentSleepLogId', response.data.data.sleepLogId);
        alert('Pelacakan tidur dimulai!');
      } else {
        console.error('Unexpected response structure:', response);
        alert('Gagal memulai pelacakan tidur: struktur respons tidak sesuai.');
      }
    } catch (err) {
      console.error("Error starting sleep:", err);
      alert('Error memulai tidur: ' + (err.response?.data?.message || 'Silakan coba lagi.'));
    }
  };

  const handleEndSleep = async () => {
    if (!currentSleepLogId) {
      alert('Tidak ada sesi tidur aktif untuk diakhiri.');
      return;
    }
    try {
      const response = await endSleep(currentSleepLogId);
      console.log('End Sleep Response:', response); // Debug log
      
      // Fix: Akses data dari response.data.data
      if (response && response.data && response.data.data) {
        const { durationMinutes, pointsAwarded } = response.data.data;
        alert(`Tidur berakhir. Durasi: ${durationMinutes} menit, Poin: ${pointsAwarded}`);
        setCurrentSleepLogId(null);
        localStorage.removeItem('currentSleepLogId');
        await refreshDashboardData();
      } else {
        console.error('Unexpected response structure:', response);
        alert('Gagal mengakhiri pelacakan tidur: struktur respons tidak sesuai.');
      }
    } catch (err) {
      console.error("Error ending sleep:", err);
      alert('Error mengakhiri tidur: ' + (err.response?.data?.message || 'Silakan coba lagi.'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-xl">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-red-500">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  const dataToDisplay = dashboardData || {
    username: 'Pengguna',
    totalPoints: 0,
    currentStreak: 0,
    lastSleep: null,
    recentSleeps: [],
    unlockedAchievements: []
  };

  // Fungsi untuk mendapatkan username dari berbagai sumber
  const getDisplayUsername = () => {
    // Prioritas: 1. Dashboard data, 2. Auth context, 3. Default
    return dataToDisplay.username || 
           dataToDisplay.name || 
           dataToDisplay.fullName ||
           dataToDisplay.displayName ||
           user?.username || 
           user?.name || 
           user?.email?.split('@')[0] || // Gunakan bagian sebelum @ dari email
           'Pengguna';
  };

  // Persiapan data untuk Chart.js dari dataToDisplay
  const sleepChartLabels = dataToDisplay.recentSleeps
    .map(log => new Date(log.sleepDate || log.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    .slice(-7)
    .reverse();

  const sleepDurationData = dataToDisplay.recentSleeps
    .map(log => (log.durationMinutes / 60).toFixed(1))
    .slice(-7)
    .reverse();

  const sleepPointsData = dataToDisplay.recentSleeps
    .map(log => log.points)
    .slice(-7)
    .reverse();

  const sleepDurationChartData = {
    labels: sleepChartLabels,
    datasets: [
      {
        label: 'Durasi Tidur (jam)',
        data: sleepDurationData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const sleepPointsChartData = {
    labels: sleepChartLabels,
    datasets: [
      {
        label: 'Poin Tidur Diberikan',
        data: sleepPointsData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Tren Tidur Selama 7 Hari Terakhir',
        color: 'white'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              if (context.dataset.label.includes('Durasi')) {
                label += ' jam';
              } else if (context.dataset.label.includes('Poin')) {
                label += ' poin';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 bg-zinc-950 text-white min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-700 text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2 sm:mb-0">Tidur.io Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span className="text-base md:text-lg">
            Selamat datang, <span className="font-semibold text-green-400">{getDisplayUsername()}</span>!
          </span>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-300 w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-col sm:flex-row md:grid md:grid-cols-3 bg-zinc-800 p-1 rounded-lg mb-6 w-full">
          <TabsTrigger value="overview" className="py-2 text-base md:text-lg text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-colors duration-200 w-full mb-1 sm:mb-0 sm:mr-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="logging" className="py-2 text-base md:text-lg text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-colors duration-200 w-full mb-1 sm:mb-0 sm:mr-1">
            Log Tidur
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2 text-base md:text-lg text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-colors duration-200 w-full">
            Riwayat & Statistik
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Overview */}
        <TabsContent value="overview">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
            <Card className="bg-zinc-800 p-4 md:p-6 rounded-xl shadow-lg border border-zinc-700 flex flex-col items-center text-center">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg md:text-xl font-semibold mb-1 text-gray-300">Total Poin Tidur</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-4xl md:text-5xl font-extrabold text-yellow-400">{dataToDisplay.totalPoints || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 p-4 md:p-6 rounded-xl shadow-lg border border-zinc-700 flex flex-col items-center text-center">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg md:text-xl font-semibold mb-1 text-gray-300">Streak Saat Ini</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-4xl md:text-5xl font-extrabold text-red-400">{dataToDisplay.currentStreak || 0} hari</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 p-4 md:p-6 rounded-xl shadow-lg border border-zinc-700 flex flex-col items-center text-center">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg md:text-xl font-semibold mb-1 text-gray-300">Durasi Tidur Terakhir</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-blue-400">
                  {dataToDisplay.lastSleep ? `${(dataToDisplay.lastSleep.durationMinutes / 60).toFixed(1)} jam` : 'N/A'}
                </p>
                {dataToDisplay.lastSleep && (
                  <p className="text-sm text-gray-400 mt-2">
                    Berakhir: {new Date(dataToDisplay.lastSleep.endTime).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="mb-6 md:mb-10 p-4 md:p-6 bg-zinc-800 rounded-xl shadow-lg border border-zinc-700">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-200">Log Tidur Terbaru</h2>
            {dataToDisplay.recentSleeps && dataToDisplay.recentSleeps.length > 0 ? (
              <ul className="space-y-3">
                {[...dataToDisplay.recentSleeps]
                  .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                  .map((log) => (
                    <li key={log.id} className="bg-zinc-700 p-3 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="text-base md:text-lg font-semibold text-gray-300">
                          {new Date(log.startTime).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(log.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {log.endTime ? new Date(log.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Aktif'}
                        </p>
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        {log.durationMinutes && <p className="text-base md:text-lg font-bold text-teal-400">{(log.durationMinutes / 60).toFixed(1)} jam</p>}
                        {log.points && <p className="text-sm text-yellow-300">{log.points} poin</p>}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">Tidak ada log tidur terbaru ditemukan. Mulai sesi baru!</p>
            )}
          </section>

          <section className="p-4 md:p-6 bg-zinc-800 rounded-xl shadow-lg border border-zinc-700">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-200">Achievement</h2>
            {dataToDisplay.unlockedAchievements && dataToDisplay.unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataToDisplay.unlockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-zinc-700 p-3 rounded-lg flex items-center space-x-3">
                    <span className="text-2xl md:text-3xl text-purple-400">🏆</span>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-300">{achievement.name}</h3>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">Belum ada achievement yang terbuka. Teruslah tidur dengan baik!</p>
            )}
          </section>
        </TabsContent>

        {/* Tab Content: Logging Sleep */}
        <TabsContent value="logging">
          <section className="p-4 md:p-6 bg-zinc-800 rounded-xl shadow-lg border border-zinc-700">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-200">Kontrol Sesi Tidur</h2>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <Button
                onClick={handleStartSleep}
                disabled={!!currentSleepLogId}
                className={`flex-1 py-3 px-6 rounded-lg text-base md:text-lg font-semibold transition duration-300 ${
                  currentSleepLogId ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                }`}
              >
                {currentSleepLogId ? 'Sesi Tidur Aktif...' : 'Mulai Pelacakan Tidur'}
              </Button>
              <Button
                onClick={handleEndSleep}
                disabled={!currentSleepLogId}
                className={`flex-1 py-3 px-6 rounded-lg text-base md:text-lg font-semibold transition duration-300 ${
                  !currentSleepLogId ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                }`}
              >
                Akhiri Sesi Tidur
              </Button>
            </div>
            {currentSleepLogId && (
              <p className="mt-4 text-center text-sm text-gray-400 animate-pulse">
                Melacak sesi tidur aktif dengan ID: {currentSleepLogId.substring(0, 8)}...
              </p>
            )}
          </section>
        </TabsContent>

        {/* Tab Content: History & Stats */}
        <TabsContent value="history">
          <section className="p-4 md:p-6 bg-zinc-800 rounded-xl shadow-lg border border-zinc-700">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-200">Riwayat dan Statistik Tidur</h2>
            {dataToDisplay.recentSleeps && dataToDisplay.recentSleeps.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-zinc-700 p-4 rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-300">Durasi Tidur 7 Hari Terakhir</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 md:h-80">
                    <Line data={sleepDurationChartData} options={chartOptions} />
                  </CardContent>
                </Card>
                <Card className="bg-zinc-700 p-4 rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-300">Poin Tidur 7 Hari Terakhir</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 md:h-80">
                    <Line data={sleepPointsChartData} options={chartOptions} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-gray-400 text-center">Tidak ada data tidur yang cukup untuk grafik. Log lebih banyak tidur!</p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;