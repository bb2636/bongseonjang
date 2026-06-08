import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '@/shared/config/apiConfig';

async function completeSocialProfile(token: string, profileData: {
  name: string;
  phone?: string;
  referralId?: string;
  addressName?: string;
  zonecode?: string;
  address?: string;
  addressDetail?: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/social/complete-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to complete profile');
  }
}

export function useSignupCompletePage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const completeSocialSignup = async () => {
      if (isProcessingRef.current) {
        return;
      }
      
      const pendingLoginData = sessionStorage.getItem('pendingSocialLogin');
      if (!pendingLoginData) {
        return;
      }
      
      isProcessingRef.current = true;
      
      try {
        const { token, user } = JSON.parse(pendingLoginData);
        
        const pendingProfileData = sessionStorage.getItem('pendingSocialProfileData');
        if (pendingProfileData) {
          const profileData = JSON.parse(pendingProfileData);
          await completeSocialProfile(token, profileData);
          sessionStorage.removeItem('pendingSocialProfileData');
        }
        
        loginWithToken(token, {
          id: user.id,
          email: user.email,
          name: user.name,
        });
        sessionStorage.removeItem('pendingSocialLogin');
      } catch (error) {
        console.error('Failed to complete social login:', error);
      }
    };

    completeSocialSignup();
  }, [loginWithToken]);

  const onButtonClick = useCallback(() => {
    sessionStorage.removeItem('signupFormData');
    sessionStorage.removeItem('pendingSocialLogin');
    sessionStorage.removeItem('pendingSocialProfileData');
    navigate('/');
  }, [navigate]);

  return {
    state: {},
    actions: {
      onButtonClick,
    },
  };
}
