import { useInvestmentInfoDetailPage } from '../hooks/useInvestmentInfoDetailPage';
import InvestmentInfoDetailView from '../views/InvestmentInfoDetailView';

export default function InvestmentInfoDetailPage() {
  const { state, actions } = useInvestmentInfoDetailPage();

  return <InvestmentInfoDetailView state={state} actions={actions} />;
}
