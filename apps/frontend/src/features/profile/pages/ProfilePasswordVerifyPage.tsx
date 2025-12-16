import { useProfilePasswordVerify } from '../hooks/useProfilePasswordVerify';
import ProfilePasswordVerifyView from '../views/ProfilePasswordVerifyView';

export default function ProfilePasswordVerifyPage() {
  const {
    email,
    password,
    passwordError,
    isSubmitting,
    handlePasswordChange,
    handleSubmit,
    handleBack,
  } = useProfilePasswordVerify();

  return (
    <ProfilePasswordVerifyView
      email={email}
      password={password}
      passwordError={passwordError}
      isSubmitting={isSubmitting}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
}
