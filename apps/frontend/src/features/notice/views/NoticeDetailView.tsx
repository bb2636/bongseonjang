import { AppBar } from '../../../components';
import { AppBarSpacer } from '../../../components/AppBar';
import { useNoticeDetailPage } from '../hooks/useNoticeDetailPage';
import './NoticeDetailView.css';

type NoticeDetailPageReturn = ReturnType<typeof useNoticeDetailPage>;

interface NoticeDetailViewProps {
  state: NoticeDetailPageReturn['state'];
  actions: NoticeDetailPageReturn['actions'];
}

export default function NoticeDetailView({ state, actions }: NoticeDetailViewProps) {
  const { notice, isLoading, notFound } = state;
  const { handleBack, handleCartClick } = actions;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="notice-detail__skeleton">
          <div className="notice-detail__skeleton-header" />
          <div className="notice-detail__skeleton-content" />
        </div>
      );
    }

    if (notFound) {
      return <p className="notice-detail__status">공지사항을 찾을 수 없습니다.</p>;
    }

    if (!notice) {
      return null;
    }

    return (
      <article className="notice-detail">
        <header className="notice-detail__header">
          <div className="notice-detail__meta">
            <span className="notice-detail__category">{notice.category}</span>
            <span className="notice-detail__date">{notice.createdAt}</span>
          </div>
          <h1 className="notice-detail__title">{notice.title}</h1>
        </header>
        <div
          className="notice-detail__content"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      </article>
    );
  };

  return (
    <div className="notice-detail-page">
      <AppBar
        variant="subpage"
        title="공지사항"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />
      <AppBarSpacer variant="subpage" />

      <main className="notice-detail-page__content">{renderContent()}</main>
    </div>
  );
}
