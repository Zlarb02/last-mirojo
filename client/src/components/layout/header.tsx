import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LogOut } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import logoPath from "@/assets/logo.png";

export function Header() {
  const { logoutMutation } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 ml-16 sm:mx-auto">
          <img
            src={logoPath}
            alt="Mirojo Logo"
            width={32}
            height={32}
            className="w-8 h-8 dark:invert"
          />
          <h1 className="text-2xl font-bold hidden sm:block">mirojo.app</h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            title={t("auth.logout")}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
