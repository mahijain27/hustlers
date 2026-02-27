import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('rxguard_token');
    const savedUser = localStorage.getItem('rxguard_user');

    if (savedToken && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null; // invalid json
      }
    }
    return null;
  });

  const loginUserContext = (userData, token) => {
    localStorage.setItem('rxguard_token', token);
    localStorage.setItem('rxguard_role', userData.role);
    localStorage.setItem('rxguard_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rxguard_token');
    localStorage.removeItem('rxguard_role');
    localStorage.removeItem('rxguard_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUserContext, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
