import { SignupFormProvider } from '../hooks/useSignupFormState';
import { useSignupPage } from '../hooks/useSignupPage';
import SignupEmailView from '../views/SignupEmailView';

function SignupEmailPageContent() {
  const { currentStep, emailStep, passwordStep, profileStep, onBack } = useSignupPage();

  return (
    <SignupEmailView
      currentStep={currentStep}
      emailStep={emailStep}
      passwordStep={passwordStep}
      profileStep={profileStep}
      onBack={onBack}
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
