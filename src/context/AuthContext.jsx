import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import authService from '@services/auth';
import notificationHub from '@services/notificationHub';

const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  user: 'auth_user',
  expiresAt: 'auth_expires_at',
};

const AuthContext = createContext(null);

const loadFromStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    const refresh = window.localStorage.getItem(STORAGE_KEYS.refreshToken);
    const userRaw = window.localStorage.getItem(STORAGE_KEYS.user);
    const expiresAt = window.localStorage.getItem(STORAGE_KEYS.expiresAt);
    return {
      token,
      refreshToken: refresh,
      user: userRaw ? JSON.parse(userRaw) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };
  } catch {
    return null;
  }
};

const persistAuth = ({ token, refreshToken, user, expiresAt }) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, token ?? '');
  window.localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken ?? '');
  window.localStorage.setItem(STORAGE_KEYS.user, user ? JSON.stringify(user) : '');
  window.localStorage.setItem(STORAGE_KEYS.expiresAt, expiresAt ?? '');
};

const clearStorage = () => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
};

export const AuthProvider = ({ children }) => {
  const initialAuth = useMemo(() => loadFromStorage(), []);
  const [token, setToken] = useState(initialAuth?.token || null);
  const [refreshToken, setRefreshToken] = useState(initialAuth?.refreshToken || null);
  const [user, setUser] = useState(initialAuth?.user || null);
  const [expiresAt, setExpiresAt] = useState(initialAuth?.expiresAt || null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    persistAuth({
      token,
      refreshToken,
      user,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : '',
    });
  }, [token, refreshToken, user, expiresAt]);

  useEffect(() => {
    notificationHub.setAccessTokenProvider(() => {
      if (token) return token;
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(STORAGE_KEYS.accessToken) || null;
      }
      return null;
    });
    if (!token) {
      notificationHub.stop();
    }
  }, [token]);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      setExpiresAt(response.expiresAt);
      return response;
    } catch (error) {
      setAuthError(error.message || 'Login failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await authService.register(payload);
      return response;
    } catch (error) {
      setAuthError(error.message || 'Register failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setExpiresAt(null);
    clearStorage();
    notificationHub.stop();
  }, []);

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      user,
      expiresAt,
      isAuthenticated,
      authLoading,
      authError,
      login,
      register,
      logout,
      setAuthError,
    }),
    [
      token,
      refreshToken,
      user,
      expiresAt,
      isAuthenticated,
      authLoading,
      authError,
      login,
      register,
      logout,
      setAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;

