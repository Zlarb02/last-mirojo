import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useLayoutEffect } from "react";
import { themes, ThemeVariant } from "@/lib/themes";
import { ThemePreferences } from "@/lib/client-types";
import { useBackground } from "./use-background";

interface UseThemePreferencesReturn {
  preferences: ThemePreferences | undefined;
  isLoading: boolean;
  updatePreferences: (prefs: Partial<ThemePreferences>) => void;
}

export function useThemePreferences(): UseThemePreferencesReturn {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { updateBackground } = useBackground(); // Déplacer ici l'appel du hook

  const { data: preferences, isLoading } = useQuery<ThemePreferences>({
    queryKey: ["theme-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/theme-preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const data = (await res.json()) as ThemePreferences;
      return data;
    },
    select: (data) => {
      // Synchroniser explicitement next-themes avec les préférences du serveur
      // if (data.themeMode) {
      //   setTheme(data.themeMode);
      // }
      return data;
    },
    // Garder les données en cache plus longtemps pour éviter les re-fetches inutiles
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const { mutate: updatePreferences, mutateAsync: updatePreferencesAsync } =
    useMutation({
      mutationFn: async (newPrefs: Partial<ThemePreferences>) => {
        const res = await fetch("/api/user/theme-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPrefs),
        });
        if (!res.ok) throw new Error("Failed to update preferences");
        // Ne pas essayer de parser la réponse comme du JSON
        return newPrefs; // Retourner les nouvelles préférences telles quelles
      },
      onMutate: async (newPrefs) => {
        // Cancel any outgoing refetches to avoid showing stale data
        await queryClient.cancelQueries({ queryKey: ["theme-preferences"] });

        if (newPrefs.themeMode) {
          // Attendre que next-themes termine la mise à jour
          await setTheme(newPrefs.themeMode);
        }

        // Appliquer les changements immédiatement avant la requête
        applyThemePreferences(newPrefs);

        // Mettre à jour le cache optimistiquement
        const previousPrefs = queryClient.getQueryData(["theme-preferences"]);
        queryClient.setQueryData(["theme-preferences"], (old: any) => ({
          ...old,
          ...newPrefs,
        }));

        return { previousPrefs };
      },
      onError: (error, variables, context) => {
        // En cas d'erreur, restaurer les préférences précédentes
        if (context?.previousPrefs) {
          queryClient.setQueryData(
            ["theme-preferences"],
            context.previousPrefs
          );
          applyThemePreferences(context.previousPrefs as ThemePreferences);
        }
      },
      onSettled: () => {
        // Wait for mutation to complete before allowing refetches
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["theme-preferences"] });
        }, 100);
      },
    });

  const applyThemePreferences = (prefs: Partial<ThemePreferences>) => {
    if (!prefs) return;

    try {
      // Désactiver temporairement les transitions
      const root = document.documentElement;
      root.classList.add("disable-transitions");

      // Appliquer les changements
      // Appliquer la variante du thème
      if (prefs.themeVariant && themes[prefs.themeVariant as ThemeVariant]) {
        const config = themes[prefs.themeVariant as ThemeVariant];

        // Appliquer les variables de base du thème
        document.documentElement.style.setProperty(
          "--radius",
          config.variables.radius
        );
        document.documentElement.style.setProperty(
          "--border-width",
          config.variables.borderWidth
        );

        // Appliquer les couleurs du thème sauf si des couleurs personnalisées existent
        if (!prefs.customColors?.primary) {
          document.documentElement.style.setProperty(
            "--primary",
            config.variables.colors.primary
          );
        }
        if (!prefs.customColors?.secondary) {
          document.documentElement.style.setProperty(
            "--secondary",
            config.variables.colors.secondary
          );
        }
      }

      // Appliquer les couleurs personnalisées si elles existent
      if (prefs.customColors) {
        const { primary, secondary } = prefs.customColors;
        if (primary) {
          document.documentElement.style.setProperty("--primary", primary);
        }
        if (secondary) {
          document.documentElement.style.setProperty("--secondary", secondary);
        }
      }

      if (prefs.themeMode) {
        setTheme(prefs.themeMode);
      }

      if (prefs.background) {
        const bg = prefs.background;
        updateBackground(
          bg.type,
          bg.url,
          Number(bg.overlay),
          bg.isMuted ?? true,
          bg.volume ?? 0.5
        );
      }

      // Réactiver les transitions après un court délai
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.remove("disable-transitions");
          // Ajouter la classe de transition une fois les changements appliqués
          root.classList.add("theme-transition");
        });
      });
    } catch (error) {
      console.error("Erreur lors de l'application des préférences:", error);
    }
  };

  useLayoutEffect(() => {
    if (preferences && !isLoading) {
      applyThemePreferences(preferences);
    }
  }, [preferences, isLoading]);

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferencesAsync, // Export the async version
  };
}
