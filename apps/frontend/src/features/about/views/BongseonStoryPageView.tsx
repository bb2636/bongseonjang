import { AppBar } from '../../../components';
import { useBongseonStoryPage } from '../hooks/useBongseonStoryPage';
import './BongseonStoryPageView.css';

export default function BongseonStoryPageView() {
  const { handleBack, handleCartClick } = useBongseonStoryPage();

  return (
    <div className="bongseon-story-page">
      <AppBar
        title="봉선장 이야기"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
        className="bongseon-story-page__app-bar"
      />
      <div className="bongseon-story-page__hero" role="banner">
        <div className="bongseon-story-page__hero-overlay" />
        <div className="bongseon-story-page__hero-content">
          <p className="bongseon-story-page__hero-kicker">바다의 신선함을</p>
          <p className="bongseon-story-page__hero-kicker">당신의 집까지</p>
          <h1 className="bongseon-story-page__hero-title">가장 빠르고 가장 신선하게-</h1>
        </div>
      </div>

      <div className="bongseon-story-page__content">
        <section className="bongseon-story-page__section">
          <div className="bongseon-story-page__section-header">
            <span className="bongseon-story-page__section-mark" aria-hidden />
            <div>
              <p className="bongseon-story-page__section-label">안녕하세요- 봉선장입니다</p>
              <p className="bongseon-story-page__section-title">안녕하세요- 봉선장입니다</p>
            </div>
          </div>
          <p className="bongseon-story-page__paragraph">
            부안에서 나고 자란 봉선장은 스무살에 서울로 상경해, 12년간 살명서 자신이 알고 있던
            ‘신선함’, ‘합리적인 가격’과는 다른 수산물 유통을 겪으면서, ‘내가 직접 생산하고 유통하면 좀
            다른 시장을 만들 수 있을 것 같다’ 라는 생각을 갖고 귀어를 선택했습니다 귀어를 하고 보니 역시
            복잡한 유통 단계를 거침으로써 수산물의 신선함이 떨어지는 것은 물론이고 높은 유통 마진으로
            인해 생산자와 소비자 모두 피해를 보고 있다는 것을 알게되었습니다.
          </p>
          <p className="bongseon-story-page__paragraph">
            복잡한 유통 단계로 잍한 가격 상승을 방지하기 위해 직접 생산하고, 온라인 판매를 시작하면서
            합리적인 가격으로 제공하려 노력하고 있습니다. 더불어 택배 배송만으로는 수산물이 가장 신선한
            상태로 소비자에게 전달될 수 없다는 점을 깨닫고, 궁극적으로, 생산부터 배송까지 직접하는
            ‘새벽배송/당일배송’이 가능한 시스템을 구축 중에 있습니다. 많은 기대와 관심 부탁드립니다.
            감사합니다.
          </p>
          <p className="bongseon-story-page__signature">- 봉선장 -</p>
        </section>
      </div>
    </div>
  );
}
