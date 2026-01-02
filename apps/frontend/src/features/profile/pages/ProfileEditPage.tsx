import { useProfileEdit } from '../hooks/useProfileEdit';
import ProfileEditView from '../views/ProfileEditView';

export default function ProfileEditPage() {
  const {
    email,
    name,
    phone,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    isMarketingEmail,
    isMarketingSms,
    nameError,
    phoneError,
    isSubmitting,
    isLoading,
    showSuccessModal,
    handleNameChange,
    handlePhoneChange,
    handleBirthYearChange,
    handleBirthMonthChange,
    handleBirthDayChange,
    handleGenderChange,
    handleMarketingEmailChange,
    handleMarketingSmsChange,
    handleSubmit,
    handleBack,
    handleModalConfirm,
    handleWithdrawClick,
    handlePhoneVerifyClick,
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
      birthYear={birthYear}
      birthMonth={birthMonth}
      birthDay={birthDay}
      gender={gender}
      isMarketingEmail={isMarketingEmail}
      isMarketingSms={isMarketingSms}
      nameError={nameError}
      phoneError={phoneError}
      isSubmitting={isSubmitting}
      showSuccessModal={showSuccessModal}
      onNameChange={handleNameChange}
      onPhoneChange={handlePhoneChange}
      onBirthYearChange={handleBirthYearChange}
      onBirthMonthChange={handleBirthMonthChange}
      onBirthDayChange={handleBirthDayChange}
      onGenderChange={handleGenderChange}
      onMarketingEmailChange={handleMarketingEmailChange}
      onMarketingSmsChange={handleMarketingSmsChange}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onModalConfirm={handleModalConfirm}
      onWithdrawClick={handleWithdrawClick}
      onPhoneVerifyClick={handlePhoneVerifyClick}
    />
  );
}
