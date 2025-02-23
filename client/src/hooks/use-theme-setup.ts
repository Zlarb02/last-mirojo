import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemePreferences } from "./use-theme-preferences";
import { themes } from "@/lib/themes";

export function useThemeSetup() {
  const { setTheme } = useTheme();
  const { preferences } = useThemePreferences();

  useEffect(() => {
    if (!preferences) return;

    // Priorité aux préférences de la base de données
    if (preferences.themeMode) {
      setTheme(preferences.themeMode);
    }

    if (preferences.themeVariant && themes[preferences.themeVariant]) {
      const config = themes[preferences.themeVariant];
      const root = document.documentElement;

      root.style.setProperty("--radius", config.variables.radius);
      root.style.setProperty("--border-width", config.variables.borderWidth);

      // Mettre à jour le localStorage pour la cohérence
      localStorage.setItem("theme-variant", preferences.themeVariant);
    }

    // Les couleurs personnalisées sont déjà gérées par use-theme-preferences
  }, [preferences, setTheme]);
}
