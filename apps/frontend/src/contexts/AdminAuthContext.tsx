import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

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

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.isAdmin) {
            setIsAuthenticated(true);
            setIsAdmin(true);
          } else {
            localStorage.removeItem('admin_token');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          localStorage.removeItem('admin_token');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

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
