import { ReactNode } from 'react';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="layout-wrapper">
      <header className="layout-header">
        <div className="layout-header-content">
          <h1 className="layout-logo">Project Name</h1>
        </div>
      </header>
      <main className="layout-main">
        <div className="layout-main-content">
          {children}
        </div>
      </main>
      <footer className="layout-footer">
        &copy; {new Date().getFullYear()} Project Name. All rights reserved.
      </footer>
    </div>
  );
}
