/* eslint-disable no-unused-vars */
// src/pages/dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchDashboard, startSleep, endSleep } from "../services/api";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";

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
  const [notification, setNotification] = useState(null);
  const [currentSleepLogId, setCurrentSleepLogId] = useState(() => {
    return localStorage.getItem('currentSleepLogId') || null;
  });

  console.log('Dashboard - userId:', userId);
  console.log('Dashboard - user:', user);
  console.log('Dashboard - isAuthenticated:', isAuthenticated);
  console.log('Dashboard - dashboardData:', dashboardData);

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

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
      console.log('Refresh Dashboard API Response:', res.data);
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
      console.log('Start Sleep Response:', response);
      
      if (response && response.data && response.data.data && response.data.data.sleepLogId) {
        setCurrentSleepLogId(response.data.data.sleepLogId);
        localStorage.setItem('currentSleepLogId', response.data.data.sleepLogId);
        showNotification('🌙 Sleep tracking dimulai! Selamat tidur dan semoga bermimpi indah~', 'success');
      } else {
        console.error('Unexpected response structure:', response);
        showNotification('Oops! Ada masalah saat memulai tracking. Coba lagi ya!', 'error');
      }
    } catch (err) {
      console.error("Error starting sleep:", err);
      showNotification('Error memulai tidur: ' + (err.response?.data?.message || 'Silakan coba lagi.'), 'error');
    }
  };

  const handleEndSleep = async () => {
    if (!currentSleepLogId) {
      showNotification('Tidak ada sesi tidur aktif untuk diakhiri.', 'warning');
      return;
    }
    try {
      const response = await endSleep(currentSleepLogId);
      console.log('End Sleep Response:', response);
      
      if (response && response.data && response.data.data) {
        const { durationMinutes, pointsAwarded } = response.data.data;
        const hours = (durationMinutes / 60).toFixed(1);
        showNotification(`🌅 Selamat pagi! Durasi tidur: ${hours} jam (${durationMinutes} menit). Poin yang diperoleh: ${pointsAwarded} ⭐`, 'success');
        setCurrentSleepLogId(null);
        localStorage.removeItem('currentSleepLogId');
        await refreshDashboardData();
      } else {
        console.error('Unexpected response structure:', response);
        showNotification('Gagal mengakhiri pelacakan tidur: struktur respons tidak sesuai.', 'error');
      }
    } catch (err) {
      console.error("Error ending sleep:", err);
      showNotification('Error mengakhiri tidur: ' + (err.response?.data?.message || 'Silakan coba lagi.'), 'error');
    }
  };

  // Notification component
  const NotificationBar = ({ notification }) => {
    if (!notification) return null;

    const getNotificationStyles = (type) => {
      switch (type) {
        case 'success':
          return 'bg-green-900/50 border-green-500/50 text-green-100';
        case 'error':
          return 'bg-red-900/50 border-red-500/50 text-red-100';
        case 'warning':
          return 'bg-yellow-900/50 border-yellow-500/50 text-yellow-100';
        default:
          return 'bg-blue-900/50 border-blue-500/50 text-blue-100';
      }
    };

    const getIcon = (type) => {
      switch (type) {
        case 'success':
          return <CheckCircle className="w-5 h-5" />;
        case 'error':
          return <XCircle className="w-5 h-5" />;
        case 'warning':
          return <AlertCircle className="w-5 h-5" />;
        default:
          return <Info className="w-5 h-5" />;
      }
    };

    return (
      <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-md ${getNotificationStyles(notification.type)} shadow-xl`}>
        <div className="flex items-center space-x-3">
          {getIcon(notification.type)}
          <p className="flex-1 text-sm font-medium">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-slate-300 animate-pulse">Loading your sleep journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="text-center p-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700">
          <div className="text-6xl mb-4">😴💤</div>
          <p className="text-xl text-red-400">Oops! {error}</p>
        </div>
      </div>
    );
  }

  const dataToDisplay = dashboardData || {
    username: 'Dreamer',
    totalPoints: 0,
    currentStreak: 0,
    lastSleep: null,
    recentSleeps: [],
    unlockedAchievements: []
  };

  const getDisplayUsername = () => {
    return dataToDisplay.username || 
           dataToDisplay.name || 
           dataToDisplay.fullName ||
           dataToDisplay.displayName ||
           user?.username || 
           user?.name || 
           user?.email?.split('@')[0] ||
           'Dreamer';
  };

  // Chart data preparation
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
        label: 'Sleep Hours',
        data: sleepDurationData,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: 'rgb(30, 41, 59)',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const sleepPointsChartData = {
    labels: sleepChartLabels,
    datasets: [
      {
        label: 'Points Earned',
        data: sleepPointsData,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: 'rgb(30, 41, 59)',
        pointBorderWidth: 2,
        pointRadius: 4,
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
          color: 'rgb(203, 213, 225)',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: 'rgb(203, 213, 225)',
        bodyColor: 'rgb(203, 213, 225)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              if (context.dataset.label.includes('Hours')) {
                label += ' hrs';
              } else if (context.dataset.label.includes('Points')) {
                label += ' pts';
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
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <NotificationBar notification={notification} />
      
      <div className="container mx-auto p-4 md:p-6 min-h-screen">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 sm:p-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              Tidur.io
            </h1>
            <p className="text-slate-400 text-sm">Your sleep adventure awaits</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="text-center sm:text-right">
              <p className="text-base md:text-lg font-bold text-slate-100">
                Hey, {getDisplayUsername()}! 👋
              </p>
              <p className="text-slate-400 text-xs">Ready for sweet dreams?</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-200 text-sm"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="logging" className="w-full">
          <TabsList className="flex bg-slate-800/50 backdrop-blur-md p-1 rounded-xl mb-6 border border-slate-700/50 shadow-lg">
            <TabsTrigger 
              value="logging" 
              className="flex-1 py-3 px-3 text-sm md:text-base font-medium text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              🌙 Sleep Now
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="flex-1 py-3 px-3 text-sm md:text-base font-medium text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              📊 My Stats
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 py-3 px-3 text-sm md:text-base font-medium text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              📈 Journey
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Sleep Logging */}
          <TabsContent value="logging">
            <div className="space-y-6">
              {/* Sleep Control Card */}
              <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="mb-6">
                    <div className="text-6xl md:text-7xl mb-4">
                      {currentSleepLogId ? '😴' : '🌙'}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
                      {currentSleepLogId ? 'Sweet Dreams...' : 'Ready to Sleep?'}
                    </h2>
                    <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto mb-4">
                      {currentSleepLogId 
                        ? 'Your sleep is being tracked. Have a wonderful rest!' 
                        : 'Start tracking your sleep journey and earn dream points!'
                      }
                    </p>
                    
                    {/* Point system explanation */}
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                      <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Sistem Poin Tidur
                      </h3>
                      <div className="space-y-2 text-xs text-slate-300">
                        <p><span className="font-medium text-green-400">Poin Dasar:</span> Tidur minimal 7 jam = 10 poin per jam</p>
                        <p><span className="font-medium text-yellow-400">Bonus Streak:</span> Konsistensi 3, 7, 14, atau 30 hari berturut-turut dapat bonus poin tambahan</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                    <Button
                      onClick={handleStartSleep}
                      disabled={!!currentSleepLogId}
                      className={`flex-1 py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 ${
                        currentSleepLogId 
                          ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25'
                      }`}
                    >
                      {currentSleepLogId ? '😴 Sleeping...' : '🛌 Start Dreaming'}
                    </Button>
                    <Button
                      onClick={handleEndSleep}
                      disabled={!currentSleepLogId}
                      className={`flex-1 py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 ${
                        !currentSleepLogId 
                          ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white shadow-lg hover:shadow-orange-500/25'
                      }`}
                    >
                      {!currentSleepLogId ? '☀️ Wake Up' : '🌅 Good Morning!'}
                    </Button>
                  </div>
                  
                  {currentSleepLogId && (
                    <div className="mt-6 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                      <p className="text-purple-300 text-sm">
                        Sleep session: {currentSleepLogId.substring(0, 8)}... ✨
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-md border border-yellow-600/30 rounded-xl">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="text-xl font-bold text-yellow-400">{dataToDisplay.totalPoints || 0}</p>
                    <p className="text-yellow-300/80 text-xs">Dream Points</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-900/20 to-pink-900/20 backdrop-blur-md border border-red-600/30 rounded-xl">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">🔥</div>
                    <p className="text-xl font-bold text-red-400">{dataToDisplay.currentStreak || 0}</p>
                    <p className="text-red-300/80 text-xs">Day Streak</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-blue-600/30 rounded-xl">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">💤</div>
                    <p className="text-xl font-bold text-blue-400">
                      {dataToDisplay.lastSleep ? `${(dataToDisplay.lastSleep.durationMinutes / 60).toFixed(1)}h` : '0h'}
                    </p>
                    <p className="text-blue-300/80 text-xs">Last Sleep</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Overview */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-md border border-yellow-600/30 rounded-xl shadow-lg">
                  <CardHeader className="text-center pb-2">
                    <div className="text-4xl md:text-5xl mb-2">⭐</div>
                    <CardTitle className="text-lg font-bold text-yellow-400">Dream Points</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-2xl md:text-3xl font-black text-slate-100">{dataToDisplay.totalPoints || 0}</p>
                    <p className="text-yellow-300/80 text-xs mt-1">Keep dreaming for more!</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-900/20 to-pink-900/20 backdrop-blur-md border border-red-600/30 rounded-xl shadow-lg">
                  <CardHeader className="text-center pb-2">
                    <div className="text-4xl md:text-5xl mb-2">🔥</div>
                    <CardTitle className="text-lg font-bold text-red-400">Sleep Streak</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-2xl md:text-3xl font-black text-slate-100">{dataToDisplay.currentStreak || 0}</p>
                    <p className="text-red-300/80 text-xs mt-1">days in a row</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-blue-600/30 rounded-xl shadow-lg">
                  <CardHeader className="text-center pb-2">
                    <div className="text-4xl md:text-5xl mb-2">💤</div>
                    <CardTitle className="text-lg font-bold text-blue-400">Last Rest</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-2xl md:text-3xl font-black text-slate-100">
                      {dataToDisplay.lastSleep ? `${(dataToDisplay.lastSleep.durationMinutes / 60).toFixed(1)}h` : 'N/A'}
                    </p>
                    {dataToDisplay.lastSleep && (
                      <p className="text-blue-300/80 text-xs mt-1">
                        {new Date(dataToDisplay.lastSleep.endTime).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sleep Logs */}
              <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    📖 Recent Sleep Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  {dataToDisplay.recentSleeps && dataToDisplay.recentSleeps.length > 0 ? (
                    <div className="space-y-3">
                      {[...dataToDisplay.recentSleeps]
                        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                        .slice(0, 5)
                        .map((log, index) => (
                          <div key={log.id} className="bg-slate-700/20 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-slate-100 font-medium text-sm md:text-base">
                                  {new Date(log.startTime).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <p className="text-slate-400 text-xs md:text-sm">
                                  {new Date(log.startTime).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {log.endTime ? new Date(log.endTime).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }) : 'Active'}
                                </p>
                              </div>
                              <div className="text-right">
                                {log.durationMinutes && (
                                  <p className="text-emerald-400 font-bold text-sm md:text-base">
                                    {(log.durationMinutes / 60).toFixed(1)}h
                                  </p>
                                )}
                                {log.points && (
                                  <p className="text-yellow-400 text-xs">
                                    +{log.points} pts ⭐
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl md:text-5xl mb-3">😴</div>
                      <p className="text-slate-400 text-base">No sleep logs yet</p>
                      <p className="text-slate-500 text-sm">Start your first sleep session!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    🏆 Achievements Unlocked
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  {dataToDisplay.unlockedAchievements && dataToDisplay.unlockedAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {dataToDisplay.unlockedAchievements.map((achievement) => (
                        <div key={achievement.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-3 md:p-4 rounded-lg border border-purple-600/30 flex items-center space-x-3">
                          <span className="text-2xl md:text-3xl">🏆</span>
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-slate-100">{achievement.name}</h3>
                            <p className="text-slate-400 text-xs md:text-sm">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl md:text-5xl mb-3">🎯</div>
                      <p className="text-slate-400 text-base">No achievements yet</p>
                      <p className="text-slate-500 text-sm">Keep sleeping to unlock rewards!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Content: History & Stats */}
          <TabsContent value="history">
            <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  📈 Your Sleep Journey
                </CardTitle>
                <p className="text-slate-400 mt-2 text-sm">Track your progress over time</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {dataToDisplay.recentSleeps && dataToDisplay.recentSleeps.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <Card className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg">
                      <CardHeader className="p-3 md:p-4">
                        <CardTitle className="text-base md:text-lg font-semibold text-purple-400 flex items-center gap-2">
                          💤 Sleep Duration Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4 pt-0">
                        <div className="h-48 md:h-64">
                          <Line data={sleepDurationChartData} options={chartOptions} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/20 backdrop-blur-sm border border-slate-600/30 rounded-lg">
                      <CardHeader className="p-3 md:p-4">
                        <CardTitle className="text-base md:text-lg font-semibold text-pink-400 flex items-center gap-2">
                          ⭐ Points Earned Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4 pt-0">
                        <div className="h-48 md:h-64">
                          <Line data={sleepPointsChartData} options={chartOptions} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl md:text-7xl mb-4">📊</div>
                    <p className="text-slate-400 text-lg mb-2">Not enough data for charts</p>
                    <p className="text-slate-500 text-sm">Complete more sleep sessions to see your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;