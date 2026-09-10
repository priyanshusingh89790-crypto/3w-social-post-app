import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signupApi, loginApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while validating stored session

  // On mount: restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMeApi();
        setUser(data.data.user);
        setToken(storedToken);
      } catch {
        // Token invalid/expired — clear storage
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signup = useCallback(async (username, email, password) => {
    const { data } = await signupApi({ username, email, password });
    const { token: newToken, user: newUser } = data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginApi({ email, password });
    const { token: newToken, user: newUser } = data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
