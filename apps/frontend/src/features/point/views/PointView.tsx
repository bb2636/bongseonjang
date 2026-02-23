import { PointWallet, PointHistoryGroup } from '../types/point';
import AppBar, { AppBarSpacer } from '@/components/AppBar';
import PointBalanceCard from '../components/PointBalanceCard/PointBalanceCard';
import PointHistoryList from '../components/PointHistoryList/PointHistoryList';
import PointSkeleton from '../components/PointSkeleton';
import './PointView.css';

interface PointViewProps {
  state: {
    wallet: PointWallet | null;
    historyGroups: PointHistoryGroup[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
  actions: {
    onBackClick: () => void;
    onCartClick: () => void;
    onLoadMore: () => void;
  };
}

export default function PointView({ state, actions }: PointViewProps) {
  if (state.isLoading) {
    return (
      <div className="point-view">
        <AppBar
          variant="subpage"
          title="포인트"
          showBackButton
          onBackClick={actions.onBackClick}
          onCartClick={actions.onCartClick}
        />
        <AppBarSpacer variant="subpage" />
        <PointSkeleton />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="point-view">
        <AppBar
          variant="subpage"
          title="포인트"
          showBackButton
          onBackClick={actions.onBackClick}
          onCartClick={actions.onCartClick}
        />
        <AppBarSpacer variant="subpage" />
        <div className="point-view__error">
          <p className="point-view__error-message">{state.error}</p>
          <button
            type="button"
            className="point-view__retry-button"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="point-view">
      <AppBar
        variant="subpage"
        title="포인트"
        showBackButton
        onBackClick={actions.onBackClick}
        onCartClick={actions.onCartClick}
      />
      <AppBarSpacer variant="subpage" />
      
      <PointBalanceCard balance={state.wallet?.balance || 0} />
      
      <div className="point-view__divider" />
      
      <PointHistoryList
        groups={state.historyGroups}
        hasMore={state.hasMore}
        isLoadingMore={state.isLoadingMore}
        onLoadMore={actions.onLoadMore}
      />
    </div>
  );
}
