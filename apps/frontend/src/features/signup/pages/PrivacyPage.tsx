import { usePrivacyPage } from '../hooks/usePrivacyPage';
import PrivacyView from '../views/PrivacyView';

export default function PrivacyPage() {
  const { state, actions } = usePrivacyPage();

  return <PrivacyView state={state} actions={actions} />;
}
