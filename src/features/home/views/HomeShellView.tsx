import { AppBar } from "@/components/AppBar";
import { CategoryTabs } from "../components/CategoryTabs";
import { DefaultHomeContent } from "../components/DefaultHomeContent";
import { BestProductsContent } from "../components/BestProductsContent";
import { NewProductsContent } from "../components/NewProductsContent";
import { EventsContent } from "../components/EventsContent";
import { AllProductsContent } from "../components/AllProductsContent";
import type { HomeShellState } from "../hooks/useHomeShell";
import "./HomeShellView.css";

interface HomeShellViewProps {
  shell: HomeShellState;
}

export default function HomeShellView({ shell }: HomeShellViewProps) {
  const {
    activeTab,
    onTabChange,
    onLogoClick,
    onCartClick,
  } = shell;

  const renderContent = () => {
    switch (activeTab) {
      case 'default':
        return <DefaultHomeContent />;
      case 'best':
        return <BestProductsContent />;
      case 'new':
        return <NewProductsContent />;
      case 'event':
        return <EventsContent />;
      case 'all':
        return <AllProductsContent />;
      default:
        return <DefaultHomeContent />;
    }
  };

  return (
    <div className="home-shell">
      <AppBar onCartClick={onCartClick} onLogoClick={onLogoClick} />
      
      <main className="home-shell__content">
        <CategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
        {renderContent()}
      </main>
    </div>
  );
}
