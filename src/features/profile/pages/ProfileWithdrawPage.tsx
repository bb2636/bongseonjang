import { useProfileWithdraw } from '../hooks/useProfileWithdraw';
import ProfileWithdrawView from '../views/ProfileWithdrawView';

export default function ProfileWithdrawPage() {
  const {
    isAgreed,
    showConfirmModal,
    isWithdrawing,
    handleBack,
    handleAgreedChange,
    handleWithdrawClick,
    handleConfirmCancel,
    handleConfirmWithdraw,
  } = useProfileWithdraw();

  return (
    <ProfileWithdrawView
      isAgreed={isAgreed}
      showConfirmModal={showConfirmModal}
      isWithdrawing={isWithdrawing}
      onBack={handleBack}
      onAgreedChange={handleAgreedChange}
      onWithdrawClick={handleWithdrawClick}
      onConfirmCancel={handleConfirmCancel}
      onConfirmWithdraw={handleConfirmWithdraw}
    />
  );
}
