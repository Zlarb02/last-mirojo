import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useHash } from "@/hooks/use-hash";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { settingsSections } from "@/lib/settings-navigation";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LanguageSettings } from "@/components/settings/language-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SubscriptionSettings } from "@/components/settings/subscription-settings";
import { SettingsNav } from "@/components/settings/settings-nav";
import { ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [location] = useLocation();

  const hash = useHash();
  const [section, subsection] = hash.split("-");

  // Trouver le titre de la section et sous-section actuelle
  const currentSection = settingsSections.find((s) => s.id === section);
  const currentSubsection = currentSection?.subsections?.find(
    (s) => s.id === subsection
  );

  const renderSettingsContent = () => {
    if (section === "appearance") {
      return (
        <AppearanceSettings
          section={subsection as "theme" | "colors" | "border" | "background"}
        />
      );
    }

    if (section === "subscription") {
      return (
        <SubscriptionSettings section={subsection as "plan" | "billing"} />
      );
    }

    switch (section) {
      case "language":
        return <LanguageSettings />;
      case "notifications":
        return <NotificationSettings />;
      default:
        return <AppearanceSettings />;
    }
  };

  return (
    <>
      <SideMenu />
      <div className="min-h-screen bg-screen flex flex-col">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="p-4 sm:p-8">
              {/* Fil d'Ariane */}
              <div className="mb-6 flex items-center text-sm text-muted-foreground">
                <span>{t("settings.title")}</span>
                {currentSection && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>{t(currentSection.titleKey)}</span>
                  </>
                )}
                {currentSubsection && (
                  <>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>{t(currentSubsection.titleKey)}</span>
                  </>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation verticale (mobile et desktop) */}
                <div className="w-full lg:w-64 flex-shrink-0">
                  <SettingsNav />
                </div>

                {/* Contenu principal */}
                <div className="flex-1">
                  <div className="max-w-3xl">{renderSettingsContent()}</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
