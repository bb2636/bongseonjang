import { usePrivacyPolicyPage } from '../hooks/usePrivacyPolicyPage';
import './PrivacyPolicyView.css';

type PrivacyPolicyPageReturn = ReturnType<typeof usePrivacyPolicyPage>;

interface PrivacyPolicyViewProps {
  state: PrivacyPolicyPageReturn['state'];
  actions: PrivacyPolicyPageReturn['actions'];
}

export default function PrivacyPolicyView({ state, actions }: PrivacyPolicyViewProps) {
  return (
    <div className="privacy-policy">
      <header className="privacy-policy__header">
        <button className="privacy-policy__back" onClick={actions.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="privacy-policy__title">개인정보 처리방침</h1>
        <div className="privacy-policy__placeholder" />
      </header>
      <div className="privacy-policy__header-spacer" />

      <main className="privacy-policy__content">
        <p className="privacy-policy__intro">
          {state.companyName}(이하 '회사')는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호하기 위해 다음과 같은 개인정보 처리방침을 수립·공개합니다.
        </p>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">1. 수집하는 개인정보 항목</h2>
          <p className="privacy-policy__text">
            회사는 회원가입, 서비스 이용, 주문·결제 및 고객 문의 처리를 위해 아래와 같은 개인정보를 수집합니다.{'\n\n'}
            [회원가입 시]{'\n'}
            - 필수: 이메일, 비밀번호, 이름, 휴대폰번호{'\n'}
            - 선택: 생년월일, 성별, 추천인 정보{'\n\n'}
            [소셜 로그인 시 (카카오·네이버·구글·애플)]{'\n'}
            - 해당 서비스로부터 제공받는 식별자, 이메일, 이름(닉네임) 등 인증에 필요한 최소 정보{'\n\n'}
            [주문 및 배송 시]{'\n'}
            - 수령인 이름, 배송지 주소, 연락처, 주문 상품 정보{'\n\n'}
            [결제 시]{'\n'}
            - 결제 수단 정보, 결제 승인 정보(결제대행사를 통해 처리){'\n\n'}
            [서비스 이용 과정에서 자동 생성·수집되는 정보]{'\n'}
            - 접속 기록, 기기 정보, 서비스 이용 기록
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">2. 개인정보의 수집 및 이용 목적</h2>
          <p className="privacy-policy__text">
            - 회원 가입 및 관리, 본인 확인{'\n'}
            - 상품 주문·결제·배송 등 서비스 제공{'\n'}
            - 고객 문의 응대 및 분쟁 처리{'\n'}
            - 쿠폰·포인트 등 혜택 제공 및 마케팅 정보 안내(동의한 경우에 한함){'\n'}
            - 서비스 개선 및 신규 서비스 개발{'\n'}
            - 부정 이용 방지 및 서비스 안정성 확보
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="privacy-policy__text">
            회사는 원칙적으로 개인정보의 수집·이용 목적이 달성되면 해당 정보를 지체 없이 파기합니다. 다만 관련 법령에서 정한 기간 동안 다음과 같이 보관합니다.{'\n\n'}
            - 계약 또는 청약철회 등에 관한 기록: 5년{'\n'}
            - 대금결제 및 재화 등의 공급에 관한 기록: 5년{'\n'}
            - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년{'\n'}
            - 표시·광고에 관한 기록: 6개월{'\n'}
            - 접속 로그 등 통신사실확인자료: 3개월
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">4. 개인정보의 제3자 제공</h2>
          <p className="privacy-policy__text">
            회사는 이용자의 개인정보를 본 방침에서 고지한 범위를 넘어 제3자에게 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.{'\n\n'}
            - 이용자가 사전에 동의한 경우{'\n'}
            - 법령의 규정에 의하거나 수사기관의 적법한 요청이 있는 경우{'\n\n'}
            상품 배송을 위해 주문 정보(수령인, 주소, 연락처)는 해당 배송업체에 제공될 수 있습니다.
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">5. 개인정보 처리의 위탁</h2>
          <p className="privacy-policy__text">
            회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있으며, 위탁계약 시 개인정보가 안전하게 관리되도록 관리·감독합니다.{'\n\n'}
            - 결제 처리: 결제대행사(PG){'\n'}
            - 문자(SMS)·알림 발송: 메시지 발송 대행사{'\n'}
            - 상품 배송: 배송 대행 업체
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">6. 이용자의 권리와 행사 방법</h2>
          <p className="privacy-policy__text">
            이용자는 언제든지 본인의 개인정보를 조회·수정할 수 있으며, 수집·이용에 대한 동의 철회(회원 탈퇴)를 요청할 수 있습니다.{'\n\n'}
            - 개인정보 조회·수정: 앱 내 [마이페이지 &gt; 회원정보 수정]{'\n'}
            - 회원 탈퇴 및 계정 삭제: 앱 내 [마이페이지 &gt; 회원 탈퇴]{'\n\n'}
            계정 삭제를 요청하시면 관련 법령에 따라 보관이 필요한 정보를 제외한 모든 개인정보가 파기됩니다.
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">7. 개인정보의 파기 절차 및 방법</h2>
          <p className="privacy-policy__text">
            전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서에 기록된 정보는 분쇄하거나 소각하여 파기합니다.
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">8. 개인정보의 안전성 확보 조치</h2>
          <p className="privacy-policy__text">
            회사는 개인정보 보호를 위해 비밀번호 암호화, 접근 권한 관리, 접속 기록 보관, 보안 프로그램 설치 등 기술적·관리적 보호 조치를 시행하고 있습니다.
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">9. 개인정보 보호책임자</h2>
          <p className="privacy-policy__text">
            회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 이용자의 불만 처리 및 피해 구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.{'\n\n'}
            - 사업자: {state.companyName}{'\n'}
            - 문의: {state.privacyOfficerEmail}{'\n'}
            - 고객센터: 앱 내 [고객센터] 메뉴
          </p>
        </section>

        <section className="privacy-policy__section">
          <h2 className="privacy-policy__section-title">10. 개인정보 처리방침의 변경</h2>
          <p className="privacy-policy__text">
            본 개인정보 처리방침은 법령 및 회사 정책에 따라 변경될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.
          </p>
        </section>

        <p className="privacy-policy__effective-date">시행일자: {state.effectiveDate}</p>
      </main>
    </div>
  );
}
