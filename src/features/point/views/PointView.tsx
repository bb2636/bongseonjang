import { PointWallet, PointHistoryGroup } from '../types/point';
import PointAppBar from '../components/PointAppBar/PointAppBar';
import PointBalanceCard from '../components/PointBalanceCard/PointBalanceCard';
import PointHistoryList from '../components/PointHistoryList/PointHistoryList';
import './PointView.css';

interface PointViewProps {
  state: {
    wallet: PointWallet | null;
    historyGroups: PointHistoryGroup[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    isLoadingMore: boolean;
    onBackClick: () => void;
    onCartClick: () => void;
    onLoadMore: () => void;
  };
}

export default function PointView({ state }: PointViewProps) {
  if (state.isLoading) {
    return (
      <div className="point-view">
        <PointAppBar
          onBackClick={state.onBackClick}
          onCartClick={state.onCartClick}
        />
        <div className="point-view__loading">
          <div className="point-view__loading-spinner" />
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="point-view">
        <PointAppBar
          onBackClick={state.onBackClick}
          onCartClick={state.onCartClick}
        />
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
      <PointAppBar
        onBackClick={state.onBackClick}
        onCartClick={state.onCartClick}
        cartCount={1}
      />
      
      <PointBalanceCard balance={state.wallet?.balance || 0} />
      
      <div className="point-view__divider" />
      
      <PointHistoryList
        groups={state.historyGroups}
        hasMore={state.hasMore}
        isLoadingMore={state.isLoadingMore}
        onLoadMore={state.onLoadMore}
      />
    </div>
  );
}
