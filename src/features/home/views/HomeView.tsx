import styled from 'styled-components';
import { Button } from '../../../components';

interface HomePageNamespace {
  welcomeMessage: string;
  featureList: string[];
  handleGetStarted: () => void;
}

interface HomeViewProps {
  homePage: HomePageNamespace;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: var(--spacing-lg);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
`;

const Subtitle = styled.p`
  font-size: var(--font-size-large);
  color: var(--color-text-secondary);
  max-width: 600px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  width: 100%;
  max-width: 800px;
  margin-top: var(--spacing-lg);
`;

const FeatureCard = styled.div`
  padding: var(--spacing-lg);
  background-color: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
`;

const FeatureText = styled.p`
  color: var(--color-text-primary);
  font-weight: 500;
`;

export default function HomeView({ homePage }: HomeViewProps) {
  const { welcomeMessage, featureList, handleGetStarted } = homePage;
  
  return (
    <Container>
      <Title>{welcomeMessage}</Title>
      <Subtitle>
        Hook-First Pattern과 Clean Architecture를 적용한 풀스택 프로젝트 템플릿입니다.
      </Subtitle>
      
      <Button size="large" onClick={handleGetStarted}>
        시작하기
      </Button>
      
      <FeatureGrid>
        {featureList.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureText>{feature}</FeatureText>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </Container>
  );
}
