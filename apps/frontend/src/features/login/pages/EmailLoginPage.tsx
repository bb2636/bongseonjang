import { useEmailLogin } from '../hooks/useEmailLogin';
import EmailLoginView from '../views/EmailLoginView';

export default function EmailLoginPage() {
  const { emailLogin } = useEmailLogin();

  return <EmailLoginView emailLogin={emailLogin} />;
}
