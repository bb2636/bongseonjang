import './PaymentLoadingOverlay.css';

export type PaymentStep = 'preparing' | 'connecting' | 'waiting';

interface PaymentLoadingOverlayProps {
  step: PaymentStep;
}

const STEP_MESSAGES: Record<PaymentStep, { main: string; sub: string }> = {
  preparing: {
    main: '결제를 준비하고 있습니다',
    sub: '잠시만 기다려주세요...',
  },
  connecting: {
    main: '결제창에 연결 중입니다',
    sub: '결제 모듈을 불러오고 있습니다',
  },
  waiting: {
    main: '결제 승인 대기 중입니다',
    sub: '결제창에서 결제를 완료해주세요',
  },
};

const STEP_ORDER: PaymentStep[] = ['preparing', 'connecting', 'waiting'];

export function PaymentLoadingOverlay({ step }: PaymentLoadingOverlayProps) {
  const { main, sub } = STEP_MESSAGES[step];
  const currentIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="payment-loading-overlay">
      <div className="payment-loading-spinner" />
      <p className="payment-loading-message">{main}</p>
      <p className="payment-loading-submessage">{sub}</p>
      <div className="payment-loading-steps">
        {STEP_ORDER.map((s, index) => {
          let className = 'payment-loading-step';
          if (index < currentIndex) {
            className += ' payment-loading-step--completed';
          } else if (index === currentIndex) {
            className += ' payment-loading-step--active';
          }
          return <div key={s} className={className} />;
        })}
      </div>
    </div>
  );
}
