import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Order, MenuSection } from '../types/profile';
import { fetchUserProfile, fetchRecentOrders } from '../api/profileApi';

const MENU_SECTIONS: MenuSection[] = [
  {
    title: '쇼핑',
    items: [
      { id: 'orders', icon: 'contract', label: '주문내역', path: '/orders' },
      { id: 'reviews', icon: 'reviews', label: '리뷰', path: '/reviews' },
    ],
  },
  {
    title: '고객센터',
    items: [
      { id: 'inquiry', icon: 'support_agent', label: '1:1문의', path: '/inquiry' },
      { id: 'product-inquiry', icon: 'contact_support', label: '상품문의', path: '/product-inquiry' },
      { id: 'notice', icon: 'campaign', label: '공지사항', path: '/notice' },
      { id: 'faq', icon: 'sticky_note_2', label: 'FAQ', path: '/faq' },
    ],
  },
];

export function useProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileData, ordersData] = await Promise.all([
          fetchUserProfile(),
          fetchRecentOrders(),
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
    navigate('/reviews/pending');
  }, [navigate]);

  const handleOrderClick = useCallback((orderId: string) => {
    navigate(`/orders/${orderId}`);
  }, [navigate]);

  const handleReturnClick = useCallback((orderId: string) => {
    navigate(`/orders/${orderId}/return`);
  }, [navigate]);

  const handleReorderClick = useCallback((orderId: string) => {
    console.log('Reorder:', orderId);
  }, []);

  const handleMenuItemClick = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleViewAllOrdersClick = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  return {
    profile,
    recentOrders,
    menuSections: MENU_SECTIONS,
    isLoading,
    error,
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
  };
}
