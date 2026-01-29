import { AppBar } from '../../../components';
import { AppBarSpacer } from '../../../components/AppBar';
import { useNoticeListPage } from '../hooks/useNoticeListPage';
import './NoticeListView.css';

type NoticeListPageReturn = ReturnType<typeof useNoticeListPage>;

interface NoticeListViewProps {
  state: NoticeListPageReturn['state'];
  actions: NoticeListPageReturn['actions'];
}

export default function NoticeListView({ state, actions }: NoticeListViewProps) {
  const { notices, isLoading } = state;
  const { handleBack, handleCartClick, handleNoticeClick } = actions;

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
                <span className={`notice-list__category ${notice.category === '이벤트' ? 'notice-list__category--event' : notice.category === '중요' ? 'notice-list__category--important' : ''}`}>{notice.category}</span>
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
        variant="subpage"
        title="공지사항"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />
      <AppBarSpacer variant="subpage" />

      <main className="notice-list-page__content">{renderContent()}</main>
    </div>
  );
}
