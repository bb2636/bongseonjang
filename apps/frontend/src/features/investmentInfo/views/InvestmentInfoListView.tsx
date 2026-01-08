import { AppBar } from '../../../components';
import { AppBarSpacer } from '../../../components/AppBar';
import { useInvestmentInfoListPage } from '../hooks/useInvestmentInfoListPage';
import './InvestmentInfoListView.css';

type InvestmentInfoListPageReturn = ReturnType<typeof useInvestmentInfoListPage>;

interface InvestmentInfoListViewProps {
  state: InvestmentInfoListPageReturn['state'];
  actions: InvestmentInfoListPageReturn['actions'];
}

export default function InvestmentInfoListView({ state, actions }: InvestmentInfoListViewProps) {
  const { investmentInfos, isLoading } = state;
  const { handleBack, handleCartClick, handleInvestmentInfoClick } = actions;

  const renderContent = () => {
    if (isLoading) {
      return <p className="investment-info-list__status">투자정보를 불러오는 중입니다.</p>;
    }

    if (investmentInfos.length === 0) {
      return <p className="investment-info-list__status">등록된 투자정보가 없습니다.</p>;
    }

    return (
      <ul className="investment-info-list">
        {investmentInfos.map((info) => (
          <li key={info.id} className="investment-info-list__item">
            <button
              type="button"
              className="investment-info-list__item-button"
              onClick={() => handleInvestmentInfoClick(info.id)}
            >
              <div className="investment-info-list__item-meta">
                <span className="investment-info-list__category">{info.category}</span>
                <span className="investment-info-list__date">{info.createdAt}</span>
              </div>
              <p className="investment-info-list__title">{info.title}</p>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="investment-info-list-page">
      <AppBar
        variant="subpage"
        title="투자정보"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />
      <AppBarSpacer variant="subpage" />

      <main className="investment-info-list-page__content">{renderContent()}</main>
    </div>
  );
}
