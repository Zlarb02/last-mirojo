import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background drop-shadow-md backdrop-blur"
      >
        <DropdownMenuItem
          onClick={() => i18n.changeLanguage("en")}
          className={`transition-colors duration-200 ${
            i18n.language === "en" ? "force-hover" : ""
          }`}
        >
          {t("settings.english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => i18n.changeLanguage("fr")}
          className={`transition-colors duration-200 ${
            i18n.language === "fr" ? "force-hover" : ""
          }`}
        >
          {t("settings.french")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
