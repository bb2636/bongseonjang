import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchHomeData } from '../../home/api/homeDataApi';
import PasswordSetupView from '../views/PasswordSetupView';

interface PendingSocialLogin {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default function PasswordSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { loginWithToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingLogin = location.state as PendingSocialLogin | null;

  const handleSubmit = async (password: string) => {
    if (!pendingLogin) {
      setError('로그인 정보가 없습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pendingLogin.token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '비밀번호 설정에 실패했습니다');
      }

      loginWithToken(pendingLogin.token, pendingLogin.user);
      queryClient.prefetchQuery({
        queryKey: ['homeData'],
        queryFn: fetchHomeData,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 설정에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (pendingLogin) {
      loginWithToken(pendingLogin.token, pendingLogin.user);
      queryClient.prefetchQuery({
        queryKey: ['homeData'],
        queryFn: fetchHomeData,
      });
    }
    navigate('/', { replace: true });
  };

  return (
    <PasswordSetupView
      onSubmit={handleSubmit}
      onSkip={handleSkip}
      isLoading={isLoading}
      error={error}
    />
  );
}
