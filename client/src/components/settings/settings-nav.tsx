import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { settingsSections } from "@/lib/settings-navigation";
import * as Icons from "lucide-react";
import { useHash } from "@/hooks/use-hash";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SettingsNav() {
  const { t } = useTranslation();
  const hash = useHash();
  const [currentSection, currentSubsection] = hash.split("-");

  const IconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons];
    return Icon ? <div className="h-4 w-4" /> : null;
  };

  return (
    <ScrollArea className="lg:w-64 border-b lg:border-b-0 lg:border-r">
      <nav className="p-4">
        {/* Menu horizontal sur mobile */}
        <div className="flex lg:hidden space-x-4 overflow-x-auto">
          {settingsSections.map((section) => (
            <div key={section.id} className="min-w-fit">
              <div
                onClick={() => (window.location.hash = section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                  currentSection === section.id
                    ? "bg-secondary/20"
                    : "hover:bg-secondary/10"
                )}
              >
                {IconComponent(section.icon)}
                <span>{t(section.titleKey)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sous-menus horizontaux sur mobile */}
        {settingsSections.map((section) =>
          section.subsections && currentSection === section.id ? (
            <div
              key={`${section.id}-sub-mobile`}
              className="mt-4 lg:hidden -mx-4 px-4 py-2 border-y bg-muted/50"
            >
              <div className="flex gap-2 overflow-x-auto">
                {section.subsections.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() =>
                      (window.location.hash = `${section.id}-${sub.id}`)
                    }
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                      currentSubsection === sub.id
                        ? "bg-background"
                        : "hover:bg-background/50"
                    )}
                  >
                    {t(sub.titleKey)}
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}

        {/* Menu vertical avec sous-menus intégrés sur desktop */}
        <div className="hidden lg:flex lg:flex-col space-y-2">
          {settingsSections.map((section) => (
            <div key={section.id}>
              <div
                onClick={() => (window.location.hash = section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  currentSection === section.id
                    ? "bg-secondary/20"
                    : "hover:bg-secondary/10"
                )}
              >
                {IconComponent(section.icon)}
                <span>{t(section.titleKey)}</span>
              </div>

              {section.subsections && (
                <div
                  className={cn(
                    "ml-6 mt-1 space-y-1",
                    currentSection === section.id ? "block" : "hidden"
                  )}
                >
                  {section.subsections.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() =>
                        (window.location.hash = `${section.id}-${sub.id}`)
                      }
                      className={cn(
                        "px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer",
                        currentSection === section.id &&
                          currentSubsection === sub.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {t(sub.titleKey)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </ScrollArea>
  );
}
