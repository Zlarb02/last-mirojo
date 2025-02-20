import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetPortal,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  PanelLeft,
  Home,
  Plus,
  Save,
  Settings,
  Maximize,
  Minimize,
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
    { href: "/my-games", icon: Save, label: t("navigation.mySaves") },
    { href: "/settings", icon: Settings, label: t("navigation.settings") },
  ];

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">{t("navigation.toggleMenu")}</span>
          </Button>
        </SheetTrigger>
        <SheetPortal>
          <SheetContent
            side="left"
            className="w-72 p-6 border-r shadow-xl bg-white dark:bg-gray-950"
          >
            <SheetTitle className="text-lg font-semibold mb-4">
              {t("navigation.menu")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {t("navigation.menuDescription")}
            </SheetDescription>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-base py-6",
                      location === item.href && "bg-secondary/60"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </SheetPortal>
      </Sheet>

      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm hover:shadow-md transition-shadow"
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
