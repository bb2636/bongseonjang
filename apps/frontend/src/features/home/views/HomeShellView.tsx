import { AppBar, AppBarSpacer } from "@/components/AppBar";
import { CategoryTabs, CategoryTabsSpacer } from "../components/CategoryTabs";
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
  const { activeTab, onTabChange, onLogoClick } = shell;

  const renderContent = () => {
    switch (activeTab) {
      case "default":
        return <DefaultHomeContent />;
      case "best":
        return <BestProductsContent />;
      case "new":
        return <NewProductsContent />;
      case "event":
        return <EventsContent />;
      case "all":
        return <AllProductsContent />;
      default:
        return <DefaultHomeContent />;
    }
  };

  return (
    <div className="home-shell">
      <AppBar onLogoClick={onLogoClick} />
      <AppBarSpacer />

      <CategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
      <CategoryTabsSpacer />

      <main className="home-shell__content">
        {renderContent()}
      </main>
    </div>
  );
}
