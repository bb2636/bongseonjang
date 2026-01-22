import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { API_BASE_URL } from '../shared/config/apiConfig';

const ADMIN_TOKEN_KEY = 'admin_token';
const LAST_ACTIVITY_KEY = 'admin_last_activity';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return;

    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    
    inactivityTimerRef.current = setTimeout(() => {
      clearSession();
      window.location.href = '/admin/login';
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearSession]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed > INACTIVITY_TIMEOUT_MS) {
          clearSession();
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.isAdmin) {
            setIsAuthenticated(true);
            setIsAdmin(true);
            resetInactivityTimer();
          } else {
            clearSession();
          }
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearSession, resetInactivityTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isAuthenticated, resetInactivityTimer]);

  const login = useCallback((token: string) => {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    setIsAuthenticated(true);
    setIsAdmin(true);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const logout = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    clearSession();
  }, [clearSession]);

  const value: AdminAuthContextType = {
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
}
