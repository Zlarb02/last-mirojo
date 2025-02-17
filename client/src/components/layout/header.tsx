import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LogOut } from "lucide-react";

export function Header() {
  const { logoutMutation } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl ml-16 sm:mx-auto font-bold">mirojo.app</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
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
