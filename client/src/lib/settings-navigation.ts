export interface SettingsSection {
  id: string;
  titleKey: string;
  icon: string;
  subsections?: SettingsSubSection[];
}

export interface SettingsSubSection {
  id: string;
  titleKey: string;
}

export const settingsSections: SettingsSection[] = [
  {
    id: "appearance",
    titleKey: "settings.appearance.title",
    icon: "palette",
    subsections: [
      { id: "theme", titleKey: "theme.mode" },
      { id: "themes", titleKey: "theme.presets" },
      { id: "colors", titleKey: "theme.colors" },
      { id: "border", titleKey: "theme.borderStyle" },
      { id: "background", titleKey: "theme.background.title" },
    ],
  },
  {
    id: "subscription",
    titleKey: "settings.subscription.title",
    icon: "credit-card",
    subsections: [
      { id: "plan", titleKey: "settings.subscription.currentPlan" },
      { id: "billing", titleKey: "settings.subscription.billing" },
    ],
  },
  {
    id: "notifications",
    titleKey: "settings.notifications.title",
    icon: "bell",
  },
  {
    id: "language",
    titleKey: "settings.language",
    icon: "globe",
  },
];
