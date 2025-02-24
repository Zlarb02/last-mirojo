import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemePreferences } from "./use-theme-preferences";
import { themes, ThemeVariant } from "@/lib/themes";
import { processThemeColor } from '@/lib/color-utils';

export function useThemeSetup() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { preferences, isLoading } = useThemePreferences();

  useEffect(() => {
    if (!preferences || isLoading) return;

    try {
      const root = document.documentElement;
      const isDark = resolvedTheme === 'dark';

      const applyColorVariables = (colorType: string, colorValue: string) => {
        const processed = processThemeColor(colorValue, isDark);
        root.style.setProperty(`--${colorType}`, processed.background);
        root.style.setProperty(`--${colorType}-foreground`, processed.foreground);
        root.style.setProperty(`--${colorType}-hover`, processed.hover);
      };

      if (preferences.themeVariant) {
        const config = themes[preferences.themeVariant as ThemeVariant];
        if (config) {
          root.style.setProperty("--border-width", config.variables.borderWidth);
          root.style.setProperty("--radius", config.variables.radius);

          // Appliquer les couleurs du thème si aucune couleur personnalisée n'existe
          if (!preferences.customColors?.primary) {
            applyColorVariables('primary', config.variables.colors.primary);
          }
          if (!preferences.customColors?.secondary) {
            applyColorVariables('secondary', config.variables.colors.secondary);
          }
          if (!preferences.customColors?.muted) {
            applyColorVariables('muted', config.variables.colors.muted);
          }
        }
      }

      // Appliquer les couleurs personnalisées si elles existent
      if (preferences.customColors) {
        Object.entries(preferences.customColors).forEach(([key, value]) => {
          if (value) {
            applyColorVariables(key, value);
          }
        });
      }

      if (preferences.themeMode) {
        setTheme(preferences.themeMode);
      }

    } catch (error) {
      console.error("Erreur lors de l'application des préférences du thème:", error);
    }
  }, [preferences, isLoading, setTheme, theme, resolvedTheme]);
}
