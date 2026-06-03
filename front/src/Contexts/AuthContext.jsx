import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const displayName = localStorage.getItem('displayName');

    if (token && role) {
      setUser({ token, role, userId, email, displayName });
    }
    setLoading(false);
  }, []);

  const login = (session) => {
    const { token, role, userId, email, displayName } = session;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    if (email) localStorage.setItem('email', email);
    if (displayName) localStorage.setItem('displayName', displayName);
    if (role === 'manager') {
      localStorage.setItem('managerId', userId);
    }
    setUser({ token, role, userId, email, displayName });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('displayName');
    localStorage.removeItem('managerId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}
