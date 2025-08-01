import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext"; // Pastikan path ini benar
import Login from "../pages/login";
import Register from "../pages/register";
import Dashboard from "../pages/dashboard";

/**
 * Komponen PrivateRoute yang diperbarui untuk melindungi rute.
 * Ini akan menunggu hingga AuthContext selesai memeriksa status autentikasi
 * dari localStorage (menggunakan isAuthReady) sebelum memutuskan untuk
 * mengizinkan akses atau mengalihkan.
 */
function PrivateRoute({ children }) {
  // Mengambil status autentikasi dan status kesiapan dari AuthContext
  const { isAuthenticated, isAuthReady } = useAuth();

  // Log untuk debugging: membantu melihat status saat PrivateRoute dievaluasi
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'isAuthReady:', isAuthReady);

  // Jika AuthContext belum selesai memeriksa status autentikasi, tampilkan loading.
  // Ini mencegah pengalihan prematur ke halaman login.
  if (!isAuthReady) {
    console.log('PrivateRoute - Auth context not ready, showing loading...');
    // Anda bisa mengganti ini dengan spinner loading yang lebih baik atau UI loading global
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white text-xl">
        Memuat autentikasi...
      </div>
    );
  }

  // Setelah AuthContext siap, periksa apakah pengguna terautentikasi.
  if (isAuthenticated) {
    console.log('PrivateRoute - User is authenticated, rendering children.');
    // Jika terautentikasi, render children (komponen rute yang dilindungi)
    return children;
  } else {
    console.log('PrivateRoute - User is NOT authenticated, redirecting to login.');
    // Jika tidak terautentikasi, alihkan ke halaman login
    return <Navigate to="/login" replace />; // Gunakan 'replace' untuk mengganti entri di history
  }
}

export default function AppRouter() {
  // Kita bisa menggunakan isAuthReady di sini juga jika ada kebutuhan untuk
  // menampilkan loading screen global sebelum router dirender sepenuhnya.
  // Namun, untuk kasus Anda, PrivateRoute sudah cukup menangani loading.

  return (
    <BrowserRouter>
      <Routes>
        {/* Rute publik yang tidak memerlukan autentikasi */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute yang dilindungi */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Mengalihkan rute default ke dashboard jika sudah login, atau ke login jika belum */}
        {/* Ini akan ditangani oleh PrivateRoute jika rute awal adalah '/' */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}