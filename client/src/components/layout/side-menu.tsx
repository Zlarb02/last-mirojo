import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  Plus, 
  Save, 
  Settings, 
  Maximize, 
  Minimize 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SideMenu() {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [location] = useLocation();

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const menuItems = [
    { href: "/", icon: Home, label: t("navigation.home") },
    { href: "/new-game", icon: Plus, label: t("navigation.newGame") },
    { href: "/saves", icon: Save, label: t("navigation.mySaves") },
    { href: "/settings", icon: Settings, label: t("navigation.settings") },
  ];

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("navigation.toggleMenu")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    location === item.href && "bg-secondary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <nav className="hidden lg:flex h-screen w-64 border-r bg-background p-4 flex-col">
        <div className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  location === item.href && "bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <Minimize className="h-5 w-5" />
        ) : (
          <Maximize className="h-5 w-5" />
        )}
        <span className="sr-only">{t("navigation.toggleFullscreen")}</span>
      </Button>
    </>
  );
}
