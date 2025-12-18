import { ChangeEvent } from 'react';
import { Input, PasswordInput } from '@components';
import './GuestOrderLookupView.css';

interface GuestOrderLookupViewProps {
  guestOrderLookup: {
    ordererName: string;
    orderNumber: string;
    orderPassword: string;
    isLoading: boolean;
    isValid: boolean;
    errors: {
      ordererName: string | null;
      orderNumber: string | null;
      orderPassword: string | null;
    };
    onOrdererNameChange: (value: string) => void;
    onOrderNumberChange: (value: string) => void;
    onOrderPasswordChange: (value: string) => void;
    onOrdererNameBlur: () => void;
    onOrderNumberBlur: () => void;
    onOrderPasswordBlur: () => void;
    onSubmit: () => void;
    onBack: () => void;
  };
}

export default function GuestOrderLookupView({ guestOrderLookup }: GuestOrderLookupViewProps) {
  return (
    <div className="guest-order-container">
      <header className="guest-order-header">
        <button className="guest-order-back-button" onClick={guestOrderLookup.onBack} aria-label="뒤로가기">
          <span className="guest-order-back-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        <h1 className="guest-order-header-title">비회원 주문 조회하기</h1>
        <div className="guest-order-header-spacer" />
      </header>

      <main className="guest-order-content">
        <div className="guest-order-form">
          <div className="guest-order-input-group">
            <Input
              label="주문자명"
              type="text"
              placeholder="주문자명"
              value={guestOrderLookup.ordererName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrdererNameChange(e.target.value)}
              onBlur={guestOrderLookup.onOrdererNameBlur}
              error={guestOrderLookup.errors.ordererName}
            />

            <Input
              label="주문번호"
              type="text"
              placeholder="주문번호"
              value={guestOrderLookup.orderNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrderNumberChange(e.target.value)}
              onBlur={guestOrderLookup.onOrderNumberBlur}
              error={guestOrderLookup.errors.orderNumber}
            />

            <PasswordInput
              label="주문 비밀번호"
              placeholder="주문 비밀번호"
              value={guestOrderLookup.orderPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrderPasswordChange(e.target.value)}
              onBlur={guestOrderLookup.onOrderPasswordBlur}
              error={guestOrderLookup.errors.orderPassword}
            />
          </div>

          <button 
            className="guest-order-submit"
            onClick={guestOrderLookup.onSubmit}
            disabled={guestOrderLookup.isLoading}
          >
            {guestOrderLookup.isLoading ? '조회 중...' : '주문조회'}
          </button>
        </div>
      </main>
    </div>
  );
}
