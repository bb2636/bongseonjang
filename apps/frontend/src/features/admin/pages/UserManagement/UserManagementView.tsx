import { AdminUser } from './useUserManagement';
import './UserManagement.css';

interface UserManagementViewProps {
  users: AdminUser[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewUser: (user: AdminUser) => void;
  formatDate: (dateString: string) => string;
  formatPhone: (phone: string | null) => string;
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function UserManagementView({
  users,
  totalCount,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  onViewUser,
  formatDate,
  formatPhone,
}: UserManagementViewProps) {
  return (
    <div className="user-management">
      <div className="user-management__toolbar">
        <div className="user-management__toolbar-left">
          <span className="user-management__total">총 사용자 수</span>
          <span className="user-management__total-dot">·</span>
          <span className="user-management__total-count">{totalCount.toLocaleString()}</span>
        </div>
        <div className="user-management__toolbar-right">
          <div className="user-management__search">
            <span className="user-management__search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="성함, 이메일 주소, 연락처 등으로 검색하세요"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="user-management__search-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="user-table__error">
          <p className="user-table__error-message">{error}</p>
        </div>
      )}

      {!error && (
        <div className="user-table">
          <div className="user-table__header">
            <div className="user-table__header-row">
              <div className="user-table__header-cell user-table__header-cell--user">사용자</div>
              <div className="user-table__header-cell user-table__header-cell--email">이메일 주소</div>
              <div className="user-table__header-cell user-table__header-cell--phone">휴대폰</div>
              <div className="user-table__header-cell user-table__header-cell--orders">주문 건</div>
              <div className="user-table__header-cell user-table__header-cell--created">계정 생성일</div>
              <div className="user-table__header-cell user-table__header-cell--actions">관리</div>
            </div>
          </div>
          <div className="user-table__body">
            {isLoading ? (
              <div className="user-table__body-row user-table__body-row--loading">
                <div className="user-table__cell" style={{ flex: 1, textAlign: 'center' }}>
                  로딩 중...
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="user-table__empty">
                <p className="user-table__empty-message">
                  등록된 사용자가 없습니다.
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="user-table__body-row">
                  <div className="user-table__cell user-table__cell--user">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="user-table__avatar"
                      />
                    ) : (
                      <div className="user-table__avatar user-table__avatar--placeholder">
                        <UserIcon />
                      </div>
                    )}
                    <span className="user-table__name">{user.name}</span>
                  </div>
                  <div className="user-table__cell user-table__cell--email">
                    <span className="user-table__email">{user.email}</span>
                  </div>
                  <div className="user-table__cell user-table__cell--phone">
                    <span className="user-table__phone">{formatPhone(user.phone)}</span>
                  </div>
                  <div className="user-table__cell user-table__cell--orders">
                    <span className="user-table__orders">{user.orderCount}건</span>
                  </div>
                  <div className="user-table__cell user-table__cell--created">
                    <span className="user-table__created">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="user-table__cell user-table__cell--actions">
                    <button
                      className="user-table__action-button"
                      onClick={() => onViewUser(user)}
                    >
                      보기
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
