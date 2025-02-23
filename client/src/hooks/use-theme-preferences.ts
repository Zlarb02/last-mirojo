import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { themes } from "@/lib/themes";
import { getTextColor, adjustLuminanceForContrast } from "@/lib/color-utils";

export function useThemePreferences() {
  const { theme, setTheme } = useTheme();

  interface ThemePreferences {
    themeVariant?: keyof typeof themes;
    themeMode?: "light" | "dark" | "system";
    customColors?: {
      primary?: string;
      secondary?: string;
    };
  }

  // Charger les préférences depuis l'API
  const { data: preferences } = useQuery<ThemePreferences | null>({
    queryKey: ["theme-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/theme-preferences");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { mutate: updateThemePreferences } = useMutation({
    mutationFn: async (preferences: Partial<ThemePreferences>) => {
      const res = await fetch("/api/user/theme-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error("Failed to update theme preferences");
    },
  });

  useEffect(() => {
    if (!preferences) return;

    // Appliquer le variant
    if (preferences.themeVariant && themes[preferences.themeVariant]) {
      const config = themes[preferences.themeVariant];
      const root = document.documentElement;

      root.style.setProperty("--radius", config.variables.radius);
      root.style.setProperty("--border-width", config.variables.borderWidth);
    }

    // Appliquer les couleurs personnalisées
    if (preferences.customColors) {
      const { primary, secondary } = preferences.customColors;

      if (primary) {
        const [h, s, l] = primary.split(" ").map((v: string) => parseFloat(v));
        const adjustedL = adjustLuminanceForContrast(h, s, l);
        const hslValue = `${h} ${s}% ${adjustedL}%`;

        document.documentElement.style.setProperty("--primary", hslValue);
        document.documentElement.style.setProperty(
          "--primary-foreground",
          getTextColor(h, s, adjustedL) === "light" ? "0 0% 100%" : "0 0% 0%"
        );
      }

      if (secondary) {
        const [h, s, l] = secondary
          .split(" ")
          .map((v: string) => parseFloat(v));
        const adjustedL = adjustLuminanceForContrast(h, s, l);
        const hslValue = `${h} ${s}% ${adjustedL}%`;

        document.documentElement.style.setProperty("--secondary", hslValue);
        document.documentElement.style.setProperty(
          "--secondary-foreground",
          getTextColor(h, s, adjustedL) === "light" ? "0 0% 100%" : "0 0% 0%"
        );

        // Mettre à jour les couleurs muted
        const mutedS = s * 0.3;
        const mutedL = theme === "dark" ? 11 : 96.1;
        const mutedForegroundL = theme === "dark" ? 56.9 : 46.9;

        document.documentElement.style.setProperty(
          "--muted",
          `${h} ${mutedS}% ${mutedL}%`
        );
        document.documentElement.style.setProperty(
          "--muted-foreground",
          `${h} ${mutedS * 1.3}% ${mutedForegroundL}%`
        );
      }
    }
  }, [preferences, theme]);

  return { preferences, updateThemePreferences };
}
