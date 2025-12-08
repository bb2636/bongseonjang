import { useLogin } from '../hooks/useLogin';
import LoginView from '../views/LoginView';

export default function LoginPage() {
  const { login } = useLogin();

  return <LoginView login={login} />;
}
