"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    };
    token: string;
  } | undefined>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isUserAdmin: () => boolean; // New function to check if user is admin
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => undefined,
  register: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  isUserAdmin: () => false, // Default implementation
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on initial render and check if admin exists
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    // Check if admin user exists
    const checkAdmin = async () => {
      try {
        await fetch('/api/auth/check-admin');
        console.log('Admin check completed');
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    
    checkAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return {
        user: data.user,
        token: data.token
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Auto login after registration
      await login(email, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isUserAdmin = () => {
    return user?.isAdmin || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error, isUserAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
