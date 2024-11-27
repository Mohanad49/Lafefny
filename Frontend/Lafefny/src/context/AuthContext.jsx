import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => ({
    isAuthenticated: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
    userID: localStorage.getItem('userID'),
    userRole: localStorage.getItem('userRole'),
    username: localStorage.getItem('currentUserName')
  }));

  // Listen for storage events (in case of multiple tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setAuth({
        isAuthenticated: !!localStorage.getItem('token'),
        token: localStorage.getItem('token'),
        userID: localStorage.getItem('userID'),
        userRole: localStorage.getItem('userRole'),
        username: localStorage.getItem('currentUserName')
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    const authData = {
      isAuthenticated: true,
      token: userData.token,
      userID: userData.id,
      userRole: userData.role,
      username: userData.username
    };
    
    // Update state
    setAuth(authData);
    
    // Update localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userID', userData.id);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('currentUserName', userData.username);
  };

  const logout = () => {
    // Clear state
    setAuth({
      isAuthenticated: false,
      token: null,
      userID: null,
      userRole: null,
      username: null
    });
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUserName');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
