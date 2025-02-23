import { useTheme } from "next-themes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useLayoutEffect } from "react";
import { themes, type ThemeVariant } from "@/lib/themes";
import { getTextColor, adjustLuminanceForContrast } from "@/lib/color-utils";
import debounce from "lodash/debounce";

export interface ThemePreferences {
  themeMode?: "light" | "dark" | "system";
  themeVariant?: ThemeVariant;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  uiEffects?: boolean;
  background?: {
    type: "none" | "image" | "video";
    url: string;
    overlay: string;
  };
}

export function useThemeManager() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: preferences, isLoading } = useQuery<ThemePreferences>({
    queryKey: ["theme-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/theme-preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const data = await res.json();

      // Appliquer immédiatement le thème au chargement
      if (data.themeMode) {
        setTheme(data.themeMode);
      }

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Modifier la fonction debouncedUpdate pour ne pas utiliser le localStorage
  const debouncedUpdate = useCallback(
    debounce(async (newPrefs: Partial<ThemePreferences>) => {
      try {
        await fetch("/api/user/theme-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPrefs),
        });
        // Rafraîchir les préférences après la mise à jour
        queryClient.invalidateQueries({ queryKey: ["theme-preferences"] });
      } catch (error) {
        console.error("Failed to update theme preferences:", error);
      }
    }, 1000),
    [queryClient]
  );

  useLayoutEffect(() => {
    if (isLoading || !preferences || isInitialized) return;

    // Ajouter no-transitions pendant l'application des changements
    document.documentElement.classList.add("no-transitions");

    // Appliquer les préférences dans un seul batch pour éviter les rendus inutiles
    requestAnimationFrame(() => {
      const root = document.documentElement;

      if (preferences.themeMode) {
        setTheme(preferences.themeMode);
      }

      if (preferences.themeVariant && themes[preferences.themeVariant]) {
        const config = themes[preferences.themeVariant];
        root.style.setProperty("--radius", config.variables.radius);
        root.style.setProperty("--border-width", config.variables.borderWidth);
      }

      if (preferences.customColors) {
        const { primary, secondary } = preferences.customColors;
        if (primary) root.style.setProperty("--primary", primary);
        if (secondary) {
          root.style.setProperty("--secondary", secondary);
          const [h, s] = secondary.split(" ").map((v) => parseFloat(v));
          root.style.setProperty(
            "--muted",
            `${h} ${s * 0.3}% ${theme === "dark" ? 11 : 96.1}%`
          );
        }
      }

      if (preferences.background) {
        const { type, url, overlay } = preferences.background;
        if (type === "image" && url) {
          root.style.setProperty("--bg-image", `url(${url})`);
        }
        if (overlay) {
          root.style.setProperty("--bg-overlay-opacity", overlay);
        }
      }

      document.documentElement.classList.remove("no-transitions");
      setIsInitialized(true);
    });
  }, [preferences, isLoading, isInitialized, theme]);

  const updateMutedColors = (hslValue: string) => {
    const [h, s] = hslValue.split(" ").map((v) => parseFloat(v));
    const mutedS = s * 0.3;
    const mutedL = theme === "dark" ? 11 : 96.1;
    const mutedForeground = `${h} ${mutedS * 1.3}% ${
      theme === "dark" ? 56.9 : 46.9
    }%`;

    document.documentElement.style.setProperty(
      "--muted",
      `${h} ${mutedS}% ${mutedL}%`
    );
    document.documentElement.style.setProperty(
      "--muted-foreground",
      mutedForeground
    );
  };

  const updateTheme = useCallback(
    (newPrefs: Partial<ThemePreferences>) => {
      document.documentElement.classList.add("no-transitions");

      requestAnimationFrame(() => {
        const root = document.documentElement;

        if (newPrefs.themeMode) {
          setTheme(newPrefs.themeMode);
        }

        if (newPrefs.themeVariant && themes[newPrefs.themeVariant]) {
          const config = themes[newPrefs.themeVariant];
          root.style.setProperty("--radius", config.variables.radius);
          root.style.setProperty(
            "--border-width",
            config.variables.borderWidth
          );
        }

        if (newPrefs.customColors) {
          const { primary, secondary } = newPrefs.customColors;
          if (primary) root.style.setProperty("--primary", primary);
          if (secondary) {
            root.style.setProperty("--secondary", secondary);
            updateMutedColors(secondary);
          }
        }

        debouncedUpdate(newPrefs);
        document.documentElement.classList.remove("no-transitions");
      });
    },
    [setTheme, debouncedUpdate]
  );

  return {
    theme,
    preferences,
    isLoading,
    updateTheme,
  };
}
