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
  ChevronDown,
  ChevronRight,
  Palette,
  Languages,
  Bell,
  CreditCard,
  Sun,
  Paintbrush,
  Layout,
  Image,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SideMenu() {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [location] = useLocation();
  const hash = window.location.hash.slice(1);
  const [section] = hash.split("-");

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleSettingsClick = (href: string) => {
    const [path, hash] = href.split("#");
    if (path === "/settings") {
      window.location.hash = hash;
      return;
    }
  };

  const mainMenuItems = [
    { href: "/", icon: Home, label: t("navigation.home") },
    { href: "/new-game", icon: Plus, label: t("navigation.newGame") },
    { href: "/my-games", icon: Save, label: t("navigation.mySaves") },
  ];

  const settingsMenuItems = [
    {
      href: "/settings#appearance",
      icon: Palette,
      label: t("settings.appearance.title"),
      subItems: [
        {
          href: "/settings#appearance-theme",
          label: t("settings.appearance.theme"),
          icon: Sun,
        },
        {
          href: "/settings#appearance-colors",
          label: t("settings.appearance.colors"),
          icon: Paintbrush,
        },
        {
          href: "/settings#appearance-style",
          label: t("settings.appearance.style"),
          icon: Layout,
        },
        {
          href: "/settings#appearance-background",
          label: t("settings.appearance.background"),
          icon: Image,
        },
      ],
    },
    {
      href: "/settings#subscription",
      icon: CreditCard,
      label: t("settings.subscription.title"),
      subItems: [
        {
          href: "/settings#subscription-plan",
          label: t("settings.subscription.plan"),
          icon: CreditCard,
        },
        {
          href: "/settings#subscription-billing",
          label: t("settings.subscription.billing"),
          icon: Receipt,
        },
      ],
    },
    {
      href: "/settings#notifications",
      icon: Bell,
      label: t("settings.notifications.title"),
    },
    {
      href: "/settings#language",
      icon: Languages,
      label: t("settings.language"),
    },
  ];

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

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
            className="w-72 p-6 border-r shadow-xl bg-gray-50/15 dark:bg-gray-950/15 backdrop-blur-sm hover:backdrop-blur-md"
          >
            <SheetTitle className="text-xl font-semibold mb-4">
              {t("navigation.menu")}
            </SheetTitle>
            <SheetDescription className="sr-only text-lg">
              {t("navigation.menuDescription")}
            </SheetDescription>
            <nav className="space-y-2">
              {mainMenuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-lg py-6",
                      location === item.href && "bg-secondary/60"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              <div className="relative">
                <Link href="/settings">
                  <Button
                    variant={location === "/settings" ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-lg py-6",
                      location === "/settings" && "bg-secondary/60"
                    )}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  >
                    <Settings className="h-6 w-6" />
                    {t("navigation.settings")}
                    {isSettingsOpen ? (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                </Link>

                {isSettingsOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {settingsMenuItems.map((item) => (
                      <div key={item.href}>
                        <Button
                          variant={
                            location === "/settings" &&
                            section === item.href.split("#")[1]
                              ? "secondary"
                              : "ghost"
                          }
                          className={cn(
                            "w-full grid grid-cols-[24px,1fr,24px] items-center gap-3 py-4 pl-6",
                            location === "/settings" &&
                              section === item.href.split("#")[1] &&
                              "bg-secondary/40"
                          )}
                          onClick={() => {
                            handleSettingsClick(item.href);
                            if (item.subItems) {
                              toggleExpand(item.href);
                            }
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-left">{item.label}</span>
                          {item.subItems ? (
                            <div className="justify-self-end">
                              {expandedItems.includes(item.href) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          ) : (
                            <div />
                          )}
                        </Button>

                        {item.subItems && expandedItems.includes(item.href) && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Button
                                key={subItem.href}
                                variant={
                                  location === "/settings" &&
                                  hash === subItem.href.split("#")[1]
                                    ? "secondary"
                                    : "ghost"
                                }
                                className={cn(
                                  "w-full justify-start py-2 pl-8 text-sm",
                                  location === "/settings" &&
                                    hash === subItem.href.split("#")[1] &&
                                    "bg-secondary/20"
                                )}
                                onClick={() =>
                                  handleSettingsClick(subItem.href)
                                }
                              >
                                <subItem.icon className="h-4 w-4 mr-2 opacity-70" />
                                {subItem.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
