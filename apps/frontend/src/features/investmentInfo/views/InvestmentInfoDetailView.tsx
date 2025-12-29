import { AppBar } from '../../../components';
import { useInvestmentInfoDetailPage } from '../hooks/useInvestmentInfoDetailPage';
import './InvestmentInfoDetailView.css';

type InvestmentInfoDetailPageReturn = ReturnType<typeof useInvestmentInfoDetailPage>;

interface InvestmentInfoDetailViewProps {
  state: InvestmentInfoDetailPageReturn['state'];
  actions: InvestmentInfoDetailPageReturn['actions'];
}

export default function InvestmentInfoDetailView({ state, actions }: InvestmentInfoDetailViewProps) {
  const { investmentInfo, isLoading, notFound } = state;
  const { handleBack, handleCartClick } = actions;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="investment-info-detail__skeleton">
          <div className="investment-info-detail__skeleton-header" />
          <div className="investment-info-detail__skeleton-content" />
        </div>
      );
    }

    if (notFound) {
      return <p className="investment-info-detail__status">투자정보를 찾을 수 없습니다.</p>;
    }

    if (!investmentInfo) {
      return null;
    }

    return (
      <article className="investment-info-detail">
        <header className="investment-info-detail__header">
          <div className="investment-info-detail__meta">
            <span className="investment-info-detail__category">{investmentInfo.category}</span>
            <span className="investment-info-detail__date">{investmentInfo.createdAt}</span>
          </div>
          <h1 className="investment-info-detail__title">{investmentInfo.title}</h1>
        </header>
        <div
          className="investment-info-detail__content"
          dangerouslySetInnerHTML={{ __html: investmentInfo.content }}
        />
      </article>
    );
  };

  return (
    <div className="investment-info-detail-page">
      <AppBar
        title="투자정보"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="investment-info-detail-page__content">{renderContent()}</main>
    </div>
  );
}
