import { useTermsPage } from '../hooks/useTermsPage';
import TermsView from '../views/TermsView';

export default function TermsPage() {
  const terms = useTermsPage();

  return <TermsView terms={terms} />;
}
