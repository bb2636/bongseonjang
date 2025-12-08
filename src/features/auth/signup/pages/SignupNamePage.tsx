import { useSignupName } from '../hooks/useSignupName';
import SignupNameView from '../views/SignupNameView';

export default function SignupNamePage() {
  const { signupName } = useSignupName();

  return <SignupNameView signupName={signupName} />;
}
