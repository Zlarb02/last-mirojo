import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useLayoutEffect } from "react";
import { themes, ThemeVariant } from "@/lib/themes";

export interface ThemePreferences {
  themeMode: "light" | "dark" | "system";
  themeVariant: ThemeVariant;
  customColors?: {
    primary?: string;
    secondary?: string;
  };
  background?: {
    type: "none" | "image" | "video";
    url: string;
    overlay: string;
  };
}

export function useThemePreferences() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<ThemePreferences>({
    queryKey: ["theme-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/theme-preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
    staleTime: Infinity,
  });

  const { mutate: updatePreferences } = useMutation({
    mutationFn: async (newPrefs: Partial<ThemePreferences>) => {
      // Appliquer les changements immédiatement avant la requête
      applyThemePreferences(newPrefs);

      const res = await fetch("/api/user/theme-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["theme-preferences"], (old: any) => ({
        ...old,
        ...variables,
      }));
    },
    onError: (error, variables, context) => {
      // En cas d'erreur, on revient aux anciennes préférences
      const oldPrefs = queryClient.getQueryData(["theme-preferences"]);
      applyThemePreferences(oldPrefs as ThemePreferences);
    },
  });

  const applyThemePreferences = (prefs: Partial<ThemePreferences>) => {
    if (!prefs) return;

    document.documentElement.classList.add("no-transitions");

    if (prefs.themeMode) {
      setTheme(prefs.themeMode);
    }

    if (prefs.themeVariant && themes[prefs.themeVariant]) {
      const config = themes[prefs.themeVariant];
      document.documentElement.style.setProperty(
        "--radius",
        config.variables.radius
      );
      document.documentElement.style.setProperty(
        "--border-width",
        config.variables.borderWidth
      );
    }

    if (prefs.customColors) {
      const { primary, secondary } = prefs.customColors;
      if (primary)
        document.documentElement.style.setProperty("--primary", primary);
      if (secondary)
        document.documentElement.style.setProperty("--secondary", secondary);
    }

    if (prefs.background) {
      handleBackground(prefs.background);
    }

    requestAnimationFrame(() => {
      document.documentElement.classList.remove("no-transitions");
    });
  };

  const handleBackground = (bg: ThemePreferences["background"]) => {
    if (!bg) return;

    const cleanupOldBackground = () => {
      document.documentElement.style.removeProperty("--bg-image");
      const media = document.querySelector(
        ".bg-screen video, .bg-screen iframe"
      );
      if (media) media.remove();
    };

    cleanupOldBackground();

    if (bg.type === "image" && bg.url) {
      document.documentElement.style.setProperty(
        "--bg-image",
        `url(${bg.url})`
      );
    }

    if (bg.overlay) {
      document.documentElement.style.setProperty(
        "--bg-overlay-opacity",
        bg.overlay
      );
    }
  };

  useLayoutEffect(() => {
    if (preferences && !isLoading) {
      applyThemePreferences(preferences);
    }
  }, [preferences, isLoading]);

  return { preferences, isLoading, updatePreferences };
}
