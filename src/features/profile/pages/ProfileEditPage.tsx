import { useProfileEdit } from '../hooks/useProfileEdit';
import ProfileEditView from '../views/ProfileEditView';

export default function ProfileEditPage() {
  const {
    email,
    name,
    phone,
    newPassword,
    newPasswordConfirm,
    nameError,
    phoneError,
    passwordError,
    passwordConfirmError,
    isSubmitting,
    isLoading,
    handleNameChange,
    handlePhoneChange,
    handleNewPasswordChange,
    handleNewPasswordConfirmChange,
    handleSubmit,
    handleBack,
  } = useProfileEdit();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#FFFFFF'
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid rgba(12, 12, 12, 0.1)',
          borderTopColor: '#3B9BD5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <ProfileEditView
      email={email}
      name={name}
      phone={phone}
      newPassword={newPassword}
      newPasswordConfirm={newPasswordConfirm}
      nameError={nameError}
      phoneError={phoneError}
      passwordError={passwordError}
      passwordConfirmError={passwordConfirmError}
      isSubmitting={isSubmitting}
      onNameChange={handleNameChange}
      onPhoneChange={handlePhoneChange}
      onNewPasswordChange={handleNewPasswordChange}
      onNewPasswordConfirmChange={handleNewPasswordConfirmChange}
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
}
