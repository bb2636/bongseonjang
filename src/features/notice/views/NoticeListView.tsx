import { AppBar } from '../../../components';
import { NoticeListPageState } from '../hooks/useNoticeListPage';
import './NoticeListView.css';

interface NoticeListViewProps {
  state: NoticeListPageState;
}

export default function NoticeListView({ state }: NoticeListViewProps) {
  const { notices, handleBack, handleCartClick, handleNoticeClick } = state;

  return (
    <div className="notice-list-page">
      <AppBar
        title="공지사항"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="notice-list-page__content">
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
      </main>
    </div>
  );
}
