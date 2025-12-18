import { CompletionScreen, COMPLETION_VARIANT } from '@/components/CompletionScreen';
import { useSignupCompletePage } from '../hooks/useSignupCompletePage';

export default function SignupCompletePage() {
  const { actions } = useSignupCompletePage();

  return (
    <CompletionScreen
      variant={COMPLETION_VARIANT.SIGNUP_COMPLETE}
      onButtonClick={actions.onButtonClick}
    />
  );
}
