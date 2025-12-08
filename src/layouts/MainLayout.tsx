import styled from 'styled-components';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.h1`
  font-size: var(--font-size-large);
  font-weight: 700;
  color: var(--color-primary);
`;

const Main = styled.main`
  flex: 1;
  padding: var(--spacing-lg);
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Footer = styled.footer`
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-background-secondary);
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
`;

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <LayoutWrapper>
      <Header>
        <HeaderContent>
          <Logo>Project Name</Logo>
        </HeaderContent>
      </Header>
      <Main>
        <MainContent>
          {children}
        </MainContent>
      </Main>
      <Footer>
        &copy; {new Date().getFullYear()} Project Name. All rights reserved.
      </Footer>
    </LayoutWrapper>
  );
}
