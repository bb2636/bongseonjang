import { Snackbar } from '../../components/Snackbar';
import './Settings.css';

interface CacheInfo {
  size: number;
  maxSize: number;
}

interface CacheStatus {
  caches: {
    home: CacheInfo;
    reviews: CacheInfo;
  };
}

interface SettingsViewProps {
  cacheStatus: CacheStatus | null;
  isLoading: boolean;
  isClearingCache: boolean;
  onClearCache: (cacheType: 'all' | 'home' | 'reviews') => void;
  snackbar: { isOpen: boolean; title: string; isError?: boolean };
  onCloseSnackbar: () => void;
}

function CacheCard({ label, size, maxSize }: { label: string; size: number; maxSize: number }) {
  const percentage = maxSize > 0 ? (size / maxSize) * 100 : 0;

  return (
    <div className="settings__cache-card">
      <span className="settings__cache-card-label">{label}</span>
      <span className="settings__cache-card-value">{size} / {maxSize}</span>
      <div className="settings__progress-bar">
        <div
          className="settings__progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SettingsView({
  cacheStatus,
  isLoading,
  isClearingCache,
  onClearCache,
  snackbar,
  onCloseSnackbar,
}: SettingsViewProps) {
  return (
    <div className="settings">
      <div className="settings__section">
        <h2 className="settings__section-title">캐시 관리</h2>
        <div className="settings__card">
          {isLoading ? (
            <div className="settings__loading">로딩 중...</div>
          ) : cacheStatus ? (
            <>
              <div className="settings__cache-grid">
                <CacheCard
                  label="홈 데이터 캐시"
                  size={cacheStatus.caches.home.size}
                  maxSize={cacheStatus.caches.home.maxSize}
                />
                <CacheCard
                  label="리뷰 통계 캐시"
                  size={cacheStatus.caches.reviews.size}
                  maxSize={cacheStatus.caches.reviews.maxSize}
                />
              </div>
              <div className="settings__cache-actions">
                <button
                  className="settings__clear-all-button"
                  onClick={() => onClearCache('all')}
                  disabled={isClearingCache}
                >
                  {isClearingCache ? '초기화 중...' : '전체 초기화'}
                </button>
                <button
                  className="settings__clear-button"
                  onClick={() => onClearCache('home')}
                  disabled={isClearingCache}
                >
                  홈 캐시 초기화
                </button>
                <button
                  className="settings__clear-button"
                  onClick={() => onClearCache('reviews')}
                  disabled={isClearingCache}
                >
                  리뷰 캐시 초기화
                </button>
              </div>
            </>
          ) : (
            <div className="settings__error">캐시 상태를 불러올 수 없습니다</div>
          )}
        </div>
      </div>

      <div className="settings__section">
        <h2 className="settings__section-title">시스템 정보</h2>
        <div className="settings__card">
          <div className="settings__info-grid">
            <div className="settings__info-item">
              <span className="settings__info-label">플랫폼</span>
              <span className="settings__info-value">Node.js</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">환경</span>
              <span className="settings__info-value">Production</span>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        isOpen={snackbar.isOpen}
        title={snackbar.title}
        onClose={onCloseSnackbar}
      />
    </div>
  );
}
