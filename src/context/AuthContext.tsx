'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: any;
  setUser: (user: any) => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  fetchUser: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/checkAuth');
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
