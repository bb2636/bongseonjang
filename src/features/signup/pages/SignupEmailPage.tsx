import { useSignupEmail } from '../hooks/useSignupName';
import SignupEmailView from '../views/SignupEmailView';

export default function SignupEmailPage() {
  const { signupEmail } = useSignupEmail();

  return <SignupEmailView signupEmail={signupEmail} />;
}
