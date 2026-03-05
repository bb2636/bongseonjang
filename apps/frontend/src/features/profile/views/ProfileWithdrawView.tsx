import { BottomNav } from '../../../components/BottomNav';
import { ConfirmModal } from '../../../components';
import './ProfileWithdrawView.css';

interface ProfileWithdrawViewProps {
  isAgreed: boolean;
  showConfirmModal: boolean;
  isWithdrawing: boolean;
  onBack: () => void;
  onAgreedChange: (value: boolean) => void;
  onWithdrawClick: () => void;
  onConfirmCancel: () => void;
  onConfirmWithdraw: () => void;
}

function CheckedBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#3B9BD5"/>
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UncheckedBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1"/>
    </svg>
  );
}

const CAUTION_ITEMS = [
  '탈퇴 시 모든 주문 이력, 결제 내역, 정산 관련 자료는 복구되지 않습니다.',
  '다시 가입하셔도 기존에 저장된 데이터는 복원되지 않습니다.',
  '탈퇴 이후 동일 사업자로 재가입 시 재인증이 필요합니다.',
  '발주나 정산이 완료되지 않은 경우, 탈퇴 요청이 보류될 수 있습니다.',
  '부정 사용 방지를 위해 탈퇴 후 7일간 재가입이 불가능할 수 있습니다.',
];

export default function ProfileWithdrawView({
  isAgreed,
  showConfirmModal,
  isWithdrawing,
  onBack,
  onAgreedChange,
  onWithdrawClick,
  onConfirmCancel,
  onConfirmWithdraw,
}: ProfileWithdrawViewProps) {
  return (
    <div className="profile-withdraw">
      <header className="profile-withdraw__header">
        <button
            type="button"
            className="profile-withdraw__back-button"
            onClick={onBack}
            aria-label="뒤로가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#101112"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        <div className="profile-withdraw__header-center" />
        <div className="profile-withdraw__header-placeholder" />
      </header>
      <div className="profile-withdraw__header-spacer" />

      <div className="profile-withdraw__content">
        <h1 className="profile-withdraw__title">탈퇴 전 유의사항</h1>
        
        <ul className="profile-withdraw__caution-list">
          {CAUTION_ITEMS.map((item, index) => (
            <li key={index} className="profile-withdraw__caution-item">
              {item}
            </li>
          ))}
        </ul>

        <div 
          className="profile-withdraw__agreement"
          onClick={() => onAgreedChange(!isAgreed)}
        >
          <div className="profile-withdraw__checkbox">
            {isAgreed ? <CheckedBox /> : <UncheckedBox />}
          </div>
          <span className="profile-withdraw__agreement-text">
            위에서 안내한 내용을 모두 숙지하였으며, 동의합니다.
          </span>
        </div>
      </div>

      <div className="profile-withdraw__button-container">
        <button
          type="button"
          className="profile-withdraw__button"
          disabled={!isAgreed || isWithdrawing}
          onClick={onWithdrawClick}
        >
          {isWithdrawing ? '처리 중...' : '탈퇴하기'}
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="정말 탈퇴하시겠어요?"
        onCancel={onConfirmCancel}
        onConfirm={onConfirmWithdraw}
        cancelText="취소"
        confirmText="확인"
        confirmColor="danger"
      />

      <BottomNav />
    </div>
  );
}
