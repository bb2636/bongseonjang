import { useInvestmentInfoListPage } from '../hooks/useInvestmentInfoListPage';
import InvestmentInfoListView from '../views/InvestmentInfoListView';

export default function InvestmentInfoListPage() {
  const { state, actions } = useInvestmentInfoListPage();

  return <InvestmentInfoListView state={state} actions={actions} />;
}
