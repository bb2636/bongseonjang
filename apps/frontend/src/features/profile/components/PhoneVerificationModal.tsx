import { useState, useEffect, useRef, ChangeEvent } from 'react';
import './PhoneVerificationModal.css';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  currentPhone: string;
  onClose: () => void;
  onVerified: (newPhone: string) => void;
  onSendCode: (phone: string) => Promise<{ success: boolean; message: string }>;
  onVerifyCode: (phone: string, code: string) => Promise<{ success: boolean; message: string }>;
}

const CODE_EXPIRY_SECONDS = 180;

export default function PhoneVerificationModal({
  isOpen,
  currentPhone,
  onClose,
  onVerified,
  onSendCode,
  onVerifyCode,
}: PhoneVerificationModalProps) {
  const [newPhone, setNewPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNewPhone('');
      setVerificationCode('');
      setIsCodeSent(false);
      setTimer(0);
      setError(null);
      setSuccess(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (timer > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timer]);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNewPhone(value);
    setError(null);
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setVerificationCode(value);
    setError(null);
  };

  const isPhoneValid = /^[0-9]{11}$/.test(newPhone);

  const handleSendCode = async () => {
    if (!isPhoneValid) {
      setError('휴대폰 번호 11자리를 입력해주세요');
      return;
    }

    if (newPhone === currentPhone.replace(/-/g, '')) {
      setError('현재 등록된 번호와 동일합니다');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await onSendCode(newPhone);
      if (result.success) {
        setIsCodeSent(true);
        setTimer(CODE_EXPIRY_SECONDS);
        setVerificationCode('');
        setSuccess('인증번호가 발송되었습니다');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증번호 발송에 실패했습니다');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('인증번호를 입력해주세요');
      return;
    }

    if (timer <= 0) {
      setError('인증번호가 만료되었습니다. 다시 요청해주세요');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await onVerifyCode(newPhone, verificationCode);
      if (result.success) {
        onVerified(newPhone);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="phone-modal-overlay" onClick={onClose}>
      <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phone-modal__header">
          <h2 className="phone-modal__title">휴대폰 번호 변경</h2>
          <button type="button" className="phone-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="phone-modal__content">
          <div className="phone-modal__field">
            <label className="phone-modal__label">새 휴대폰 번호</label>
            <div className="phone-modal__input-row">
              <input
                type="text"
                inputMode="numeric"
                className="phone-modal__input"
                placeholder="휴대폰 번호 입력"
                value={newPhone}
                onChange={handlePhoneChange}
                maxLength={11}
                disabled={isCodeSent && timer > 0}
              />
              <button
                type="button"
                className="phone-modal__send-button"
                onClick={handleSendCode}
                disabled={isSending || !isPhoneValid}
              >
                {isSending ? '발송중...' : (isCodeSent && timer > 0 ? '재전송' : '인증요청')}
              </button>
            </div>
          </div>

          {isCodeSent && (
            <div className="phone-modal__field">
              <label className="phone-modal__label">인증번호</label>
              <div className="phone-modal__input-row">
                <div className="phone-modal__code-wrapper">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="phone-modal__input"
                    placeholder="인증번호 6자리"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    maxLength={6}
                  />
                  {timer > 0 && (
                    <span className="phone-modal__timer">{formatTimer()}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="phone-modal__verify-button"
                  onClick={handleVerifyCode}
                  disabled={isVerifying || timer <= 0 || verificationCode.length !== 6}
                >
                  {isVerifying ? '확인중...' : '확인'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="phone-modal__error">{error}</p>}
          {success && <p className="phone-modal__success">{success}</p>}
        </div>
      </div>
    </div>
  );
}
