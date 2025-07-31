/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // Use consistent key
    console.log('AuthContext - Token from localStorage:', token);
    
    if (token) {
      try {
        // Decode JWT to get userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('AuthContext - Decoded payload:', payload);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          console.log('AuthContext - Token expired');
          localStorage.removeItem('accessToken');
          return;
        }
        
        setUser({ token });
        setUserId(payload.userId);
        setIsAuthenticated(true);
        console.log('AuthContext - Set userId:', payload.userId);
      } catch (error) {
        console.error('AuthContext - Error decoding token:', error);
        localStorage.removeItem('accessToken');
      }
    }
  }, []);

  const login = (token) => {
    console.log('AuthContext - Login called with token');
    localStorage.setItem("accessToken", token); // Use consistent key
    
    try {
      // Decode JWT to extract userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('AuthContext - Decoded login payload:', payload);
      
      setUser({ token });
      setUserId(payload.userId);
      setIsAuthenticated(true);
      console.log('AuthContext - Login successful, userId:', payload.userId);
    } catch (error) {
      console.error('AuthContext - Error during login:', error);
    }
  };

  const logout = () => {
    console.log('AuthContext - Logout called');
    localStorage.removeItem("accessToken"); // Use consistent key
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);
  };

  const contextValue = {
    user,
    userId,
    isAuthenticated,
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