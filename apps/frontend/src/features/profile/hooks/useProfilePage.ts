import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Order, MenuSection } from '../types/profile';
import { fetchUserProfile, fetchRecentOrders } from '../api/profileApi';
import { useQuickCart } from '@/contexts/QuickCartContext';
import { useToast } from '@/contexts/ToastContext';
import { bootChannelTalk, shutdownChannelTalk } from '@/services/channelTalk';

const MENU_SECTIONS: MenuSection[] = [
  {
    title: '쇼핑',
    items: [
      { id: 'orders', icon: 'contract', label: '주문내역', path: '/orders' },
      { id: 'reviews', icon: 'reviews', label: '리뷰', path: '/review' },
    ],
  },
  {
    title: '고객센터',
    items: [
      { id: 'product-inquiry', icon: 'contact_support', label: '상품문의', path: '/my-inquiries' },
      { id: 'notice', icon: 'campaign', label: '공지사항', path: '/notice' },
      { id: 'faq', icon: 'sticky_note_2', label: 'FAQ', path: '/faq' },
    ],
  },
  {
    title: '',
    items: [
      { id: 'terms', label: '약관보기', path: '/terms' },
      { id: 'about', label: '봉선장 이야기', path: '/about', color: '#3B9BD5' },
      { id: 'logout', label: '로그아웃', action: 'logout' },
    ],
  },
];

export function useProfilePage() {
  const navigate = useNavigate();
  const { openQuickCart } = useQuickCart();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileData, ordersData] = await Promise.all([
          fetchUserProfile(),
          fetchRecentOrders(true),
        ]);
        setProfile(profileData);
        setRecentOrders(ordersData);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfileData();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const initializeChannelTalk = async () => {
      try {
        await bootChannelTalk(profile);
      } catch (error) {
        console.error('Channel Talk 초기화에 실패했습니다:', error);
      }
    };

    initializeChannelTalk();

    return () => {
      shutdownChannelTalk();
    };
  }, [isLoading, profile]);

  const handleEditProfileClick = useCallback(() => {
    navigate('/profile/verify');
  }, [navigate]);

  const handlePointsClick = useCallback(() => {
    navigate('/points');
  }, [navigate]);

  const handleCouponsClick = useCallback(() => {
    navigate('/coupons');
  }, [navigate]);

  const handleFavoritesClick = useCallback(() => {
    navigate('/wishlist');
  }, [navigate]);

  const handlePendingReviewsClick = useCallback(() => {
    navigate('/review');
  }, [navigate]);

  const handleOrderClick = useCallback((orderId: string) => {
    navigate(`/orders/${orderId}`);
  }, [navigate]);

  const handleReturnClick = useCallback((orderId: string) => {
    navigate(`/orders/${orderId}/return`);
  }, [navigate]);

  const handleReorderClick = useCallback((orderId: string) => {
    const targetOrder = recentOrders.find(order => order.id === orderId);
    const firstItem = targetOrder?.items[0];

    if (!firstItem) {
      showToast('재주문할 상품을 찾을 수 없습니다', 'error');
      return;
    }

    openQuickCart(firstItem.productId).catch(error => {
      console.error('Failed to open quick cart for reorder:', error);
      showToast('상품 정보를 불러올 수 없습니다', 'error');
    });
  }, [openQuickCart, recentOrders, showToast]);

  const handleMenuItemClick = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleViewAllOrdersClick = useCallback(() => {
    navigate('/orders/in-progress');
  }, [navigate]);

  const handleLogoutClick = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLogoutModalOpen(false);
    navigate('/login');
  }, [navigate]);

  const handleLogoutCancel = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, []);

  return {
    state: {
      profile,
      recentOrders,
      menuSections: MENU_SECTIONS,
      isLoading,
      error,
      isLogoutModalOpen,
    },
    actions: {
      onEditProfileClick: handleEditProfileClick,
      onPointsClick: handlePointsClick,
      onCouponsClick: handleCouponsClick,
      onFavoritesClick: handleFavoritesClick,
      onPendingReviewsClick: handlePendingReviewsClick,
      onOrderClick: handleOrderClick,
      onReturnClick: handleReturnClick,
      onReorderClick: handleReorderClick,
      onMenuItemClick: handleMenuItemClick,
      onViewAllOrdersClick: handleViewAllOrdersClick,
      onLogoutClick: handleLogoutClick,
      onLogoutConfirm: handleLogoutConfirm,
      onLogoutCancel: handleLogoutCancel,
    },
  };
}
