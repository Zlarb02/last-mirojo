import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemePreferences } from "./use-theme-preferences";
import { themes, ThemeVariant } from "@/lib/themes";

export function useThemeSetup() {
  const { setTheme } = useTheme();
  const { preferences, isLoading } = useThemePreferences();

  useEffect(() => {
    if (!preferences || isLoading) return;

    try {
      const root = document.documentElement;

      // Appliquer le thème sans utiliser localStorage
      if (preferences.themeMode) {
        setTheme(preferences.themeMode);
      }

      // Appliquer la variante sans utiliser localStorage
      if (preferences.themeVariant) {
        const config = themes[preferences.themeVariant as ThemeVariant];
        if (config) {
          root.style.setProperty("--radius", config.variables.radius);
          root.style.setProperty("--border-width", config.variables.borderWidth);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'application des préférences du thème:", error);
    }
  }, [preferences, isLoading, setTheme]);
}
