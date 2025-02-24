import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemePreferences } from "./use-theme-preferences";
import { themes, ThemeVariant } from "@/lib/themes";

export function useThemeSetup() {
  const { setTheme } = useTheme();
  const { preferences } = useThemePreferences();

  useEffect(() => {
    if (!preferences) return;

    // Vérifier si les valeurs ont changé avant de les mettre à jour
    const currentTheme = localStorage.getItem("theme");
    const currentVariant = localStorage.getItem("theme-variant");

    if (preferences.themeMode && preferences.themeMode !== currentTheme) {
      setTheme(preferences.themeMode);
      localStorage.setItem("theme", preferences.themeMode);
    }

    if (
      preferences.themeVariant &&
      preferences.themeVariant !== currentVariant &&
      themes[preferences.themeVariant as ThemeVariant]
    ) {
      const config = themes[preferences.themeVariant as ThemeVariant];
      const root = document.documentElement;

      root.style.setProperty("--radius", config.variables.radius);
      root.style.setProperty("--border-width", config.variables.borderWidth);
      localStorage.setItem("theme-variant", preferences.themeVariant);
    }
  }, [preferences, setTheme]);
}
