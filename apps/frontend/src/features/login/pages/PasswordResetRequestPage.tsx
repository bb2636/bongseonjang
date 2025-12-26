import { usePasswordResetRequest } from '../hooks/usePasswordResetRequest';
import PasswordResetRequestView from '../views/PasswordResetRequestView';

export default function PasswordResetRequestPage() {
  const props = usePasswordResetRequest();

  return <PasswordResetRequestView {...props} />;
}
