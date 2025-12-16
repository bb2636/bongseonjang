import FaqPageView from '../views/FaqPageView';
import { useFaqPage } from '../hooks/useFaqPage';

export default function FaqPage() {
  const state = useFaqPage();

  return <FaqPageView state={state} />;
}
