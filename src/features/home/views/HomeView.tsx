import { Button } from '../../../components';
import './HomeView.css';

interface HomePageNamespace {
  welcomeMessage: string;
  featureList: string[];
  handleGetStarted: () => void;
}

interface HomeViewProps {
  homePage: HomePageNamespace;
}

export default function HomeView({ homePage }: HomeViewProps) {
  const { welcomeMessage, featureList, handleGetStarted } = homePage;
  
  return (
    <div className="home-container">
      <h1 className="home-title">{welcomeMessage}</h1>
      <p className="home-subtitle">
        Hook-First Pattern과 Clean Architecture를 적용한 풀스택 프로젝트 템플릿입니다.
      </p>
      
      <Button size="large" onClick={handleGetStarted}>
        시작하기
      </Button>
      
      <div className="home-feature-grid">
        {featureList.map((feature, index) => (
          <div key={index} className="home-feature-card">
            <p className="home-feature-text">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
