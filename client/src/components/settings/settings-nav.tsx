import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { settingsSections } from "@/lib/settings-navigation";
import * as Icons from "lucide-react";
import { useHash } from "@/hooks/use-hash";

export function SettingsNav() {
  const { t } = useTranslation();
  const hash = useHash();
  const [currentSection, currentSubsection] = hash.split("-");

  const IconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons];
    return Icon ? <div className="h-4 w-4" /> : null;
  };

  return (
    <nav className="w-64 border-r p-4 space-y-8">
      {settingsSections.map((section) => (
        <div key={section.id}>
          <div 
            onClick={() => window.location.hash = section.id}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer",
              currentSection === section.id ? "bg-secondary/20" : "hover:bg-secondary/10"
            )}
          >
            {IconComponent(section.icon)}
            <span>{t(section.titleKey)}</span>
          </div>
          
          {section.subsections && currentSection === section.id && (
            <div className="ml-6 mt-2 space-y-1">
              {section.subsections.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => window.location.hash = `${section.id}-${sub.id}`}
                  className={cn(
                    "block px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer",
                    currentSubsection === sub.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  {t(sub.titleKey)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
