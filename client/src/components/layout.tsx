import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Maximize2, LogOut, GamepadIcon, Settings, Home } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const isFullscreen = document.fullscreenElement;
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary/50 p-4 flex flex-col space-y-2">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            {t('nav.home', 'Accueil')}
          </Button>
        </Link>
        <Link href="/my-games">
          <Button variant="ghost" className="w-full justify-start">
            <GamepadIcon className="mr-2 h-4 w-4" />
            {t('nav.myGames', 'Mes parties')}
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            {t('nav.settings', 'Réglages')}
          </Button>
        </Link>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="h-14 border-b px-4 flex items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
