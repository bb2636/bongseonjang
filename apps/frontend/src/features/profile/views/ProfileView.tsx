import { UserProfile, Order, MenuSection } from '../types/profile';
import AppBar from '../../../components/AppBar/AppBar';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import SummaryCard from '../components/SummaryCard/SummaryCard';
import RecentOrders from '../components/RecentOrders/RecentOrders';
import MenuList from '../components/MenuList/MenuList';
import BottomNav from '../../../components/BottomNav/BottomNav';
import { ConfirmModal } from '../../../components/ConfirmModal';
import './ProfileView.css';

interface ProfileViewProps {
  state: {
    profile: UserProfile | null;
    recentOrders: Order[];
    menuSections: MenuSection[];
    isLoading: boolean;
    error: string | null;
    isLogoutModalOpen: boolean;
  };
  actions: {
    onEditProfileClick: () => void;
    onPointsClick: () => void;
    onCouponsClick: () => void;
    onFavoritesClick: () => void;
    onPendingReviewsClick: () => void;
    onOrderClick: (orderId: string) => void;
    onReturnClick: (orderId: string) => void;
    onReorderClick: (orderId: string) => void;
    onMenuItemClick: (path: string) => void;
    onViewAllOrdersClick: () => void;
    onLogoutClick: () => void;
    onLogoutConfirm: () => void;
    onLogoutCancel: () => void;
  };
}

export default function ProfileView({ state, actions }: ProfileViewProps) {
  if (state.isLoading) {
    return (
      <div className="profile-view">
        <AppBar />
        <div className="profile-view__loading">
          <div className="profile-view__loading-spinner" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="profile-view">
        <AppBar />
        <div className="profile-view__error">
          <p className="profile-view__error-message">{state.error}</p>
          <button
            type="button"
            className="profile-view__retry-button"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="profile-view">
      <AppBar />
      
      <main className="profile-view__content">
        <ProfileHeader
          name={state.profile?.name || ''}
          grade={state.profile?.grade || ''}
          onEditClick={actions.onEditProfileClick}
        />

        <SummaryCard
          points={state.profile?.points || 0}
          couponCount={state.profile?.couponCount || 0}
          favoriteCount={state.profile?.favoriteCount || 0}
          pendingReviewCount={state.profile?.pendingReviewCount || 0}
          onPointsClick={actions.onPointsClick}
          onCouponsClick={actions.onCouponsClick}
          onFavoritesClick={actions.onFavoritesClick}
          onPendingReviewsClick={actions.onPendingReviewsClick}
        />

        <RecentOrders
          orders={state.recentOrders}
          onOrderClick={actions.onOrderClick}
          onReturnClick={actions.onReturnClick}
          onReorderClick={actions.onReorderClick}
          onViewAllClick={actions.onViewAllOrdersClick}
        />

        <div className="profile-view__divider" />

        <MenuList
          sections={state.menuSections}
          onItemClick={actions.onMenuItemClick}
          onLogout={actions.onLogoutClick}
        />
      </main>

      <BottomNav />

      <ConfirmModal
        isOpen={state.isLogoutModalOpen}
        title="로그아웃 하시겠습니까?"
        onCancel={actions.onLogoutCancel}
        onConfirm={actions.onLogoutConfirm}
        cancelText="취소"
        confirmText="로그아웃"
      />
    </div>
  );
}
