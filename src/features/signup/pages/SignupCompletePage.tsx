import { useSignupCompletePage } from '../hooks/useSignupCompletePage';
import SignupCompleteView from '../views/SignupCompleteView';

export default function SignupCompletePage() {
  const complete = useSignupCompletePage();

  return <SignupCompleteView complete={complete} />;
}
