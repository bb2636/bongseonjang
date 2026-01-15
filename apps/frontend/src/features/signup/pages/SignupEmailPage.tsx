import { SignupFormProvider } from '../hooks/useSignupFormState';
import { useSignupPage } from '../hooks/useSignupPage';
import SignupEmailView from '../views/SignupEmailView';

function SignupEmailPageContent() {
  const { state, actions } = useSignupPage();

  return (
    <SignupEmailView
      currentStep={state.currentStep}
      emailStep={state.emailStep}
      passwordStep={state.passwordStep}
      profileStep={state.profileStep}
      isSocialSignup={state.isSocialSignup}
      onBack={actions.onBack}
    />
  );
}

export default function SignupEmailPage() {
  return (
    <SignupFormProvider>
      <SignupEmailPageContent />
    </SignupFormProvider>
  );
}
