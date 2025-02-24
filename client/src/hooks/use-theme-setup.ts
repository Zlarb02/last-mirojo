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

      // Fonction utilitaire pour appliquer les couleurs
      const applyColorVariables = (colorType: string, colorValue: string) => {
        const colors = processThemeColor(colorValue, isDark);
        root.style.setProperty(`--${colorType}`, colors.background);
        root.style.setProperty(`--${colorType}-foreground`, colors.foreground);
      };

      if (preferences.themeMode) {
        setTheme(preferences.themeMode);
      }

      // Appliquer les couleurs personnalisées si elles existent
      if (preferences.customColors) {
        if (preferences.customColors.primary) {
          applyColorVariables('primary', preferences.customColors.primary);
        }
        
        if (preferences.customColors.secondary) {
          applyColorVariables('secondary', preferences.customColors.secondary);
        }
      }
      // Sinon, utiliser les couleurs du thème
      else if (preferences.themeVariant) {
        const config = themes[preferences.themeVariant as ThemeVariant];
        if (config) {
          root.style.setProperty("--radius", config.variables.radius);
          root.style.setProperty("--border-width", config.variables.borderWidth);
          
          applyColorVariables('primary', config.variables.colors.primary);
          applyColorVariables('secondary', config.variables.colors.secondary);
        }
      }

    } catch (error) {
      console.error("Erreur lors de l'application des préférences du thème:", error);
    }
  }, [preferences, isLoading, setTheme, theme]);
}
