import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, logoutApi, getMeApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on first load

  // On app start — check if a valid session cookie exists
  useEffect(() => {
    getMeApi()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /**
   * login(email, password) — calls real API, JWT set as HTTP-only cookie by server
   * Returns { success, user, message }
   */
  const login = async (email, password) => {
    try {
      const data = await loginApi(email, password);
      if (data.success) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  /**
   * logout() — blacklists token on server, clears HTTP-only cookie
   */
  const logout = async () => {
    try {
      await logoutApi();
    } catch (_) {
      // Even if the server call fails, clear client state
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
