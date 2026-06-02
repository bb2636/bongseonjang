import { usePrivacyPolicyPage } from '../hooks/usePrivacyPolicyPage';
import PrivacyPolicyView from '../views/PrivacyPolicyView';

export default function PrivacyPolicyPage() {
  const { state, actions } = usePrivacyPolicyPage();

  return <PrivacyPolicyView state={state} actions={actions} />;
}
