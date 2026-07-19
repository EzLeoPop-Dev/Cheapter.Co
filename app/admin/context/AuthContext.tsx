// @ts-nocheck
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock user for development
    setUser({
      name: 'Admin User',
      email: 'admin@cheapter.co',
      role: 'ADMIN',
      profileImage: ''
    });
    setIsLoading(false);
  }, []);

  const toggleRole = () => {
    setUser(prev => ({
      ...prev,
      role: prev.role === 'ADMIN' ? 'STAFF' : 'ADMIN',
      name: prev.role === 'ADMIN' ? 'Staff User' : 'Admin User',
      email: prev.role === 'ADMIN' ? 'staff@cheapter.co' : 'admin@cheapter.co'
    }));
  };

  return (
    <AuthContext.Provider value={{ user, toggleRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
