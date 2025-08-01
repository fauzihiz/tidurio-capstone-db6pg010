/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

// Define a constant for the localStorage key to prevent typos
const ACCESS_TOKEN_KEY = "accessToken";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false); // New state to indicate auth check completion
  const [error, setError] = useState(null); // Added state for handling errors within AuthContext

  // Initialize from localStorage on mount
  useEffect(() => {
    // === LOG INI HARUS MUNCUL SAAT APLIKASI DIMUAT/REFRESH ===
    console.log('AuthContext - useEffect triggered: Starting initial authentication check.');
    // =======================================================

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    console.log('AuthContext - Token from localStorage:', token ? 'Found' : 'Not Found');
    
    if (token) {
      try {
        // Decode JWT to get userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('AuthContext - Decoded payload from localStorage:', payload);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          console.log('AuthContext - Token expired, removing from localStorage.');
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          setUser(null);
          setUserId(null);
          setIsAuthenticated(false);
        } else {
          setUser({ token });
          setUserId(payload.userId);
          setIsAuthenticated(true);
          console.log('AuthContext - User authenticated from localStorage. userId:', payload.userId);
        }
      } catch (error) {
        console.error('AuthContext - Error decoding token from localStorage:', error);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        setUser(null);
        setUserId(null);
        setIsAuthenticated(false);
      }
    }
    setIsAuthReady(true); // Mark authentication check as complete
    console.log('AuthContext - Initial authentication check complete.');
  }, []); // Empty dependency array means this runs once on mount

  const login = (token) => {
    console.log('AuthContext - Login function called.');
    console.log('AuthContext - Token received by login function:', token ? 'Valid token string' : 'Invalid/Empty token');

    // Clear any previous errors
    setError(null); 

    if (!token) {
      console.error('AuthContext - Login failed: No token provided.');
      setError('Login failed: Token not received.'); 
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    console.log('AuthContext - Token saved to localStorage.');
    
    try {
      // Decode JWT to extract userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('AuthContext - Decoded login payload:', payload);
      
      setUser({ token });
      setUserId(payload.userId);
      setIsAuthenticated(true);
      console.log('AuthContext - Login successful, userId:', payload.userId);
    } catch (error) {
      console.error('AuthContext - Error during login (decoding token):', error);
      setError('Login failed: Invalid token format.'); // Set error if decoding fails
      // If decoding fails, it's safer to clear the token as it's likely malformed
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
      setUserId(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    console.log('AuthContext - Logout function called.');
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);
    setError(null); // Clear errors on logout
    console.log('AuthContext - User logged out, token removed from localStorage.');
  };

  const contextValue = {
    user,
    userId,
    isAuthenticated,
    isAuthReady, // Expose isAuthReady
    error, // Expose error state
    login,
    logout
  };

  console.log('AuthContext - Current state:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);