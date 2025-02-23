import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useHash } from "@/hooks/use-hash";
import { SideMenu } from "@/components/layout/side-menu";
import { Header } from "@/components/layout/header";
import { SettingsNav } from "@/components/settings/settings-nav";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LanguageSettings } from "@/components/settings/language-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SubscriptionSettings } from "@/components/settings/subscription-settings";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [location] = useLocation();

  const hash = useHash();
  const [section, subsection] = hash.split("-");

  const renderSettingsContent = () => {
    // Gestion des sous-sections
    if (section === "appearance") {
      return (
        <AppearanceSettings
          section={subsection as "theme" | "colors" | "style"}
        />
      );
    }

    if (section === "subscription") {
      return (
        <SubscriptionSettings section={subsection as "plan" | "billing"} />
      );
    }

    // Sections principales
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
    <div className="min-h-screen bg-screen flex flex-col lg:flex-row">
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col lg:flex-row">
          <SettingsNav />

          <div className="flex-1 p-4 sm:p-8">
            <h1 className="text-2xl font-bold mb-6">
              {t("settings.title", "Réglages")}
            </h1>

            <div className="max-w-3xl mx-auto lg:mx-0">
              {renderSettingsContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
