import { usePrivacyPage } from '../hooks/usePrivacyPage';
import PrivacyView from '../views/PrivacyView';

export default function PrivacyPage() {
  const privacy = usePrivacyPage();

  return <PrivacyView privacy={privacy} />;
}
