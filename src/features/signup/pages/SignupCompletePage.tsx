import { CompletionScreen, COMPLETION_VARIANT } from '@/components/CompletionScreen';
import { useSignupCompletePage } from '../hooks/useSignupCompletePage';

export default function SignupCompletePage() {
  const { onButtonClick } = useSignupCompletePage();

  return (
    <CompletionScreen
      variant={COMPLETION_VARIANT.SIGNUP_COMPLETE}
      onButtonClick={onButtonClick}
    />
  );
}
