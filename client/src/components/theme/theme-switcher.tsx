import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Moon, Sun, Settings, Trash2 } from "lucide-react";
import { themes, type ThemeVariant } from "@/lib/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getTextColor, adjustLuminanceForContrast } from "@/lib/color-utils";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useThemePreferences } from "@/hooks/use-theme-preferences";
import { ColorMode, CustomColors } from '@/lib/client-types';
import { useQueryClient } from "@tanstack/react-query";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [, setLocation] = useLocation();
  const { preferences, updatePreferences } = useThemePreferences();
  const { setTheme } = useTheme();
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
    updatePreferences({ themeVariant: variant });
    // Ne pas utiliser localStorage ici, laisser l'API gérer la persistance
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
        const adjustedL = adjustLuminanceForContrast(hsl.h, hsl.s, hsl.l);
        const hslValue = `${hsl.h} ${hsl.s}% ${adjustedL}%`;

        updatePreferences({
          customColors: {
            ...preferences?.customColors,
            [type]: hslValue,
          },
        });
      });

      input.click();
    } catch (error) {
      console.error("Erreur lors de la modification de la couleur:", error);
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
      <DropdownMenuContent
        align="end"
        side="bottom"
        alignOffset={-5}
        avoidCollisions={true}
      >
        <DropdownMenuLabel>{t("theme.mode")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="h-4 w-4 mr-2" />
          {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.style")}</DropdownMenuLabel>
        {Object.entries(themes).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleVariantChange(key as ThemeVariant)}
          >
            {config.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.colors")}</DropdownMenuLabel>
        <DropdownMenuItem>
          <div className="flex items-center justify-between w-full">
            <div
              className="flex items-center"
              onClick={() => setCustomColor("primary")}
            >
              <div className="w-4 h-4 rounded mr-2 bg-primary" />
              {t("theme.primaryColor")}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-2 hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                resetCustomColor("primary");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center justify-between w-full">
            <div
              className="flex items-center"
              onClick={() => setCustomColor("secondary")}
            >
              <div className="w-4 h-4 rounded mr-2 bg-secondary" />
              {t("theme.secondaryColor")}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-2 hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                resetCustomColor("secondary");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuItem>
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
