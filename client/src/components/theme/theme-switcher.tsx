import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Palette,
  Moon,
  Sun,
  Settings,
  Trash2,
  Box,
  Layers,
  Cloud,
  Diamond,
  Palette as PaletteIcon,
  Waves,
  Leaf,
} from "lucide-react";
import { themes, type ThemeVariant } from "@/lib/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  getTextColor,
  adjustLuminanceForContrast,
  processThemeColor,
  processButtonColors,
} from "@/lib/color-utils";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useThemePreferences } from "@/hooks/use-theme-preferences";
import { ColorMode, CustomColors } from "@/lib/client-types";
import { useQueryClient } from "@tanstack/react-query";

// Ajout des configurations d'icônes pour les presets
const themeIcons = {
  classic: Box,
  modern: Diamond,
  soft: Cloud,
  sharp: Layers,
  retro: PaletteIcon,
  cyber: Waves,
  nature: Leaf,
} as const;

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [, setLocation] = useLocation();
  const { preferences, updatePreferences } = useThemePreferences();
  const { setTheme, resolvedTheme } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = async (mode: ColorMode) => {
    try {
      // Wait for the mutation to complete before allowing a refetch
      await updatePreferences({ themeMode: mode });

      // Update local theme only after successful mutation
      setTheme(mode);
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const handleVariantChange = (variant: ThemeVariant) => {
    try {
      const theme = themes[variant];
      const isDark = resolvedTheme === "dark";

      // Appliquer les styles de base
      document.documentElement.style.setProperty(
        "--border-width",
        theme.variables.borderWidth
      );
      document.documentElement.style.setProperty(
        "--radius",
        theme.variables.radius
      );

      // Traiter les couleurs avec leur type spécifique
      const primaryColors = processThemeColor(
        theme.variables.colors.primary,
        isDark,
        "primary"
      );
      const secondaryColors = processThemeColor(
        theme.variables.colors.secondary,
        isDark,
        "secondary"
      );
      const mutedColors = processThemeColor(
        theme.variables.colors.muted,
        isDark,
        "muted"
      );

      // Appliquer les couleurs avec leurs états
      document.documentElement.style.setProperty(
        "--primary",
        primaryColors.background
      );
      document.documentElement.style.setProperty(
        "--primary-foreground",
        primaryColors.foreground
      );
      document.documentElement.style.setProperty(
        "--primary-hover",
        primaryColors.hover
      );

      document.documentElement.style.setProperty(
        "--secondary",
        secondaryColors.background
      );
      document.documentElement.style.setProperty(
        "--secondary-foreground",
        secondaryColors.foreground
      );
      document.documentElement.style.setProperty(
        "--secondary-hover",
        secondaryColors.hover
      );

      document.documentElement.style.setProperty(
        "--muted",
        mutedColors.background
      );
      document.documentElement.style.setProperty(
        "--muted-foreground",
        mutedColors.foreground
      );
      document.documentElement.style.setProperty(
        "--muted-hover",
        mutedColors.hover
      );

      // Réinitialiser les couleurs personnalisées lors du changement de variante
      updatePreferences({
        themeVariant: variant,
        customColors: null,
      });
    } catch (error) {
      console.error("Failed to update theme variant:", error);
    }
  };

  const setCustomColor = (type: keyof CustomColors) => {
    try {
      const input = document.createElement("input");
      input.type = "color";

      // Récupérer la valeur HSL actuelle
      const currentHSL = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${type}`)
        .trim();

      // Vérifier si la valeur HSL est valide
      const hslValues = currentHSL.split(" ").map((v) => parseFloat(v));
      if (hslValues.some(isNaN)) {
        console.warn("Invalid HSL values:", currentHSL);
        input.value = type === "primary" ? "#000000" : "#666666"; // valeurs par défaut
      } else {
        // Parser la valeur HSL (format: "H S% L%")
        const [h, s, l] = hslValues;

        // Convertir HSL en RGB puis en Hex
        const [r, g, b] = hslToRGB(h, s, l);
        const hex =
          "#" +
          [r, g, b]
            .map((x) => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("");

        input.value = hex;
      }

      input.addEventListener("change", (e) => {
        const color = e.target as HTMLInputElement;
        const hsl = hexToHSL(color.value);
        // Utiliser processThemeColor au lieu de adjustLuminanceForContrast
        const processedColors = processThemeColor(
          `${hsl.h} ${hsl.s}% ${hsl.l}%`,
          resolvedTheme === "dark"
        );

        // Appliquer immédiatement les couleurs
        document.documentElement.style.setProperty(
          `--${type}`,
          processedColors.background
        );
        document.documentElement.style.setProperty(
          `--${type}-foreground`,
          processedColors.foreground
        );

        // Sauvegarder uniquement la couleur de fond
        updatePreferences({
          customColors: {
            ...preferences?.customColors,
            [type]: processedColors.background,
          },
        });
      });

      input.click();
    } catch (error) {
      console.error("Erreur lors de la modification de la couleur:", error);
    }
  };

  const handleColorChange = (type: keyof CustomColors, color: string) => {
    try {
      const hsl = hexToHSL(color);
      const hslString = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
      const isDark = resolvedTheme === "dark";

      // Utiliser processThemeColor pour les couleurs
      const processedColors = processThemeColor(hslString, isDark);

      // Appliquer les couleurs
      document.documentElement.style.setProperty(
        `--${type}`,
        processedColors.background
      );
      document.documentElement.style.setProperty(
        `--${type}-foreground`,
        processedColors.foreground
      );
      document.documentElement.style.setProperty(
        `--${type}-hover`,
        processedColors.hover
      );

      // Mettre à jour les préférences
      updatePreferences({
        customColors: {
          ...preferences?.customColors,
          [type]: processedColors.background,
        },
      });
    } catch (error) {
      console.error(`Error updating ${type} color:`, error);
    }
  };

  const resetCustomColor = (type: keyof CustomColors) => {
    try {
      const customColors = { ...preferences?.customColors };
      delete customColors[type];

      updatePreferences({
        customColors,
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation de la couleur:", error);
    }
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">{t("common.toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup className="flex items-center gap-2 p-2">
          <Button
            variant={resolvedTheme === "light" ? "default" : "ghost"}
            size="icon"
            onClick={() => handleThemeChange("light")}
            className="flex-1"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={resolvedTheme === "dark" ? "default" : "ghost"}
            size="icon"
            onClick={() => handleThemeChange("dark")}
            className="flex-1"
          >
            <Moon className="h-4 w-4" />
          </Button>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.presets")}</DropdownMenuLabel>
        <div className="grid grid-cols-4 gap-1 p-2">
          {Object.entries(themes).map(([key, config]) => {
            const Icon = themeIcons[key as keyof typeof themeIcons];
            return (
              <Button
                key={key}
                variant="ghost"
                size="icon"
                onClick={() => handleVariantChange(key as ThemeVariant)}
                className="h-10 w-10"
                title={config.name}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.colors")}</DropdownMenuLabel>
        <div className="p-2 space-y-2">
          {["primary", "secondary", "muted"].map((type) => (
            <div key={type} className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setCustomColor(type as keyof CustomColors)}
                className="flex items-center gap-2 h-8 px-2 flex-1"
              >
                <div className={`w-4 h-4 rounded bg-${type}`} />
                <span className="text-xs">{t(`theme.${type}Color`)}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10"
                onClick={() => resetCustomColor(type as keyof CustomColors)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation("/settings#appearance")}>
          <Settings className="h-4 w-4 mr-2" />
          {t("theme.moreSettings")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Fonction utilitaire pour convertir Hex en HSL
function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Ajouter la fonction hslToRGB si elle n'est pas déjà importée
function hslToRGB(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
}
