import { AppBar } from '../../../components';
import { NoticeListPageState } from '../hooks/useNoticeListPage';
import './NoticeListView.css';

interface NoticeListViewProps {
  state: NoticeListPageState;
}

export default function NoticeListView({ state }: NoticeListViewProps) {
  const { notices, isLoading, handleBack, handleCartClick, handleNoticeClick } = state;

  const renderContent = () => {
    if (isLoading) {
      return <p className="notice-list__status">공지사항을 불러오는 중입니다.</p>;
    }

    if (notices.length === 0) {
      return <p className="notice-list__status">등록된 공지사항이 없습니다.</p>;
    }

    return (
      <ul className="notice-list">
        {notices.map((notice) => (
          <li key={notice.id} className="notice-list__item">
            <button
              type="button"
              className="notice-list__item-button"
              onClick={() => handleNoticeClick(notice.id)}
            >
              <div className="notice-list__item-meta">
                <span className="notice-list__category">{notice.category}</span>
                <span className="notice-list__date">{notice.createdAt}</span>
              </div>
              <p className="notice-list__title">{notice.title}</p>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="notice-list-page">
      <AppBar
        title="공지사항"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="notice-list-page__content">{renderContent()}</main>
    </div>
  );
}
