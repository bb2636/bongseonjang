import './TermsView.css';

interface TermsViewProps {
  terms: {
    onBack: () => void;
  };
}

export default function TermsView({ terms }: TermsViewProps) {
  return (
    <div className="terms-container">
      <header className="terms-app-bar">
        <button className="terms-back-button" onClick={terms.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18L9 12L15 6"
              stroke="#101112"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="terms-title">약관보기</h1>
        <button className="terms-cart-button" type="button" aria-label="장바구니">
          <span className="terms-cart-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M8 8.5L7 6H4"
                stroke="#0C0C0C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11H17M10 14H17"
                stroke="#0C0C0C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 8.5H19.5L18.5 19.5H7.5L6.5 8.5Z"
                stroke="#0C0C0C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 11V7C16 5.89543 15.1046 5 14 5H12C10.8954 5 10 5.89543 10 7V11"
                stroke="#0C0C0C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="terms-cart-badge" aria-label="장바구니에 1개의 상품이 있습니다.">1</span>
        </button>
      </header>

      <main className="terms-body">
        <section className="terms-selector" aria-label="서비스 이용약관 동의">
          <span className="terms-selector-label">서비스 이용약관 동의</span>
          <span className="terms-selector-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 8L10 12L14 8" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </section>

        <section className="terms-panel" aria-label="서비스 이용약관 전문">
          <p className="terms-introduction">
            본 약관은 봉선장 서비스(이하 “서비스”)를 이용하는 고객과 봉선장 사이의 권리, 의무 및 책임사항을 규정합니다.
          </p>
          <ol className="terms-list">
            <li className="terms-list-item">
              <h2 className="terms-list-title">1. 서비스 목적</h2>
              <p className="terms-list-text">
                봉선장은 제철 수산물, 손질 수산물, 급랭 수산물, 절임류 등 수산물을 온라인을 통해 주문·결제하고 배송받을 수 있는 이커머스 서비스를 제공합니다.
              </p>
            </li>
            <li className="terms-list-item">
              <h2 className="terms-list-title">2. 회원 가입 및 계정 관리</h2>
              <p className="terms-list-text">
                회원은 본인의 정보로 가입해야 하며, 타인의 명의를 도용할 수 없습니다. 계정 및 비밀번호 관리 책임은 회원에게 있으며, 이를 제3자에게 공유하거나 양도할 수 없습니다.
              </p>
            </li>
            <li className="terms-list-item">
              <h2 className="terms-list-title">3. 주문, 결제 및 배송</h2>
              <p className="terms-list-text">
                회원은 상품 상세페이지 및 주문 정보를 확인한 후 결제를 진행합니다. 결제 완료 후 주문 변경 및 취소는 서비스 내 정책에 따르며, 배송 단계에 따라 제한이 있을 수 있습니다. 배송은 택배사 및 산지 상황에 따라 일정이 변경될 수 있으며, 기상 악화 등 불가피한 사유로 지연될 수 있습니다.
              </p>
            </li>
            <li className="terms-list-item">
              <h2 className="terms-list-title">4. 환불 및 교환</h2>
              <p className="terms-list-text">
                식품 및 신선 수산물 특성상 단순 변심에 의한 환불·교환은 제한될 수 있습니다. 상품 하자, 오배송 등의 경우 사진 및 증빙을 제출하면 확인 후 환불 또는 교환을 진행합니다.
              </p>
            </li>
            <li className="terms-list-item">
              <h2 className="terms-list-title">5. 금지 행위</h2>
              <p className="terms-list-text">
                허위 정보 입력, 부정 결제, 리뷰 조작 등 서비스 운영을 방해하는 행위는 금지됩니다. 위반 시 서비스 이용 제한 또는 법적 조치를 취할 수 있습니다.
              </p>
            </li>
            <li className="terms-list-item">
              <h2 className="terms-list-title">6. 약관 변경</h2>
              <p className="terms-list-text">
                봉선장은 관련 법령 및 서비스 정책에 따라 약관을 변경할 수 있으며, 변경 시 사전 공지 후 적용합니다. 자세한 내용은 전체 약관 전문을 확인해 주세요.
              </p>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
