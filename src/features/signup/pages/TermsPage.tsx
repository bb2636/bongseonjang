import { useTermsPage } from '../hooks/useTermsPage';
import TermsView from '../views/TermsView';

export default function TermsPage() {
  const { state, actions } = useTermsPage();

  return <TermsView state={state} actions={actions} />;
}
