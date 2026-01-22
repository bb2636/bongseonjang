import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/shared/config/apiConfig';

const ADMIN_TOKEN_KEY = 'admin_token';
const LAST_ACTIVITY_KEY = 'admin_last_activity';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const location = useLocation();
  const token = useMemo(() => {
    const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!storedToken) return null;
    
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > INACTIVITY_TIMEOUT_MS) {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        return null;
      }
    }
    return storedToken;
  }, []);
  const [isChecking, setIsChecking] = useState(!!token);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsChecking(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.isAdmin) {
            setIsAdmin(true);
          } else {
            sessionStorage.removeItem(ADMIN_TOKEN_KEY);
            sessionStorage.removeItem(LAST_ACTIVITY_KEY);
            setIsAdmin(false);
          }
        } else {
          sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          sessionStorage.removeItem(LAST_ACTIVITY_KEY);
          setIsAdmin(false);
        }
      } catch {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [token]);

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (isChecking) {
    return (
      <div className="protected-route__loading">
        <div className="protected-route__spinner" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
