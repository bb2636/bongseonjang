import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const location = useLocation();
  const token = useMemo(() => localStorage.getItem('admin_token'), []);
  const [isChecking, setIsChecking] = useState(!!token);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsChecking(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.isAdmin) {
            setIsAdmin(true);
          } else {
            localStorage.removeItem('admin_token');
            setIsAdmin(false);
          }
        } else {
          localStorage.removeItem('admin_token');
          setIsAdmin(false);
        }
      } catch {
        localStorage.removeItem('admin_token');
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
