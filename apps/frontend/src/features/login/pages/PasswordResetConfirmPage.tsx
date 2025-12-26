import { usePasswordResetConfirm } from '../hooks/usePasswordResetConfirm';
import PasswordResetConfirmView from '../views/PasswordResetConfirmView';

export default function PasswordResetConfirmPage() {
  const props = usePasswordResetConfirm();

  return <PasswordResetConfirmView {...props} />;
}
