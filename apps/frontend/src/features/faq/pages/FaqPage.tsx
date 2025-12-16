import FaqPageView from '../views/FaqPageView';
import { useFaqPage } from '../hooks/useFaqPage';

export default function FaqPage() {
  const { state, actions } = useFaqPage();

  return <FaqPageView state={state} actions={actions} />;
}
