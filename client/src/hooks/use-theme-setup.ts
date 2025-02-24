import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemePreferences } from "./use-theme-preferences";
import { themes, ThemeVariant } from "@/lib/themes";
import { processThemeColor } from '@/lib/color-utils';

export function useThemeSetup() {
  const { setTheme, theme } = useTheme();
  const { preferences, isLoading } = useThemePreferences();

  useEffect(() => {
    if (!preferences || isLoading) return;

    try {
      const root = document.documentElement;
      const isDark = theme === 'dark';

      // Fonction utilitaire pour appliquer les couleurs avec tous les states nécessaires
      const applyColorVariables = (colorType: string, colorValue: string) => {
        const colors = processThemeColor(colorValue, isDark);
        root.style.setProperty(`--${colorType}`, colors.background);
        root.style.setProperty(`--${colorType}-foreground`, colors.foreground);
        root.style.setProperty(`--${colorType}-hover`, colors.hover);
      };

      if (preferences.themeVariant) {
        const config = themes[preferences.themeVariant as ThemeVariant];
        if (config) {
          root.style.setProperty("--border-width", config.variables.borderWidth);
          root.style.setProperty("--radius", config.variables.radius);

          // N'appliquer les couleurs du thème que si pas de couleurs personnalisées
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
        if (preferences.customColors.primary) {
          applyColorVariables('primary', preferences.customColors.primary);
        }
        if (preferences.customColors.secondary) {
          applyColorVariables('secondary', preferences.customColors.secondary);
        }
        if (preferences.customColors.muted) {
          applyColorVariables('muted', preferences.customColors.muted);
        }
      }

      // Appliquer le mode de thème
      if (preferences.themeMode) {
        setTheme(preferences.themeMode);
      }

    } catch (error) {
      console.error("Erreur lors de l'application des préférences du thème:", error);
    }
  }, [preferences, isLoading, setTheme, theme]);
}
