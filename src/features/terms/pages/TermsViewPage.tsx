import { useTermsViewPage } from '../hooks/useTermsViewPage';
import TermsViewPageView from '../views/TermsViewPageView';

export default function TermsViewPage() {
  const state = useTermsViewPage();

  return <TermsViewPageView state={state} />;
}
