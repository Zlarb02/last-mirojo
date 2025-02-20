import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Moon, Sun, Settings } from "lucide-react"; // Ajoutez cet import
import { themes, type ThemeVariant } from "@/lib/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getTextColor, adjustLuminanceForContrast } from "@/lib/color-utils";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter"; // Remplace router

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [variant, setVariant] = useState<ThemeVariant>("classic");
  const [, setLocation] = useLocation(); // Remplace router

  useEffect(() => {
    setMounted(true);
    
    // Restaurer le variant
    const savedVariant = localStorage.getItem("theme-variant") as ThemeVariant;
    if (savedVariant && themes[savedVariant]) {
      setVariant(savedVariant);
      applyThemeVariant(savedVariant, true); // Nouveau paramètre pour ne pas écraser les couleurs personnalisées
    }

    // Restaurer les couleurs personnalisées
    const savedColors = localStorage.getItem("custom-colors");
    if (savedColors) {
      const { primary, secondary } = JSON.parse(savedColors);
      if (primary) {
        document.documentElement.style.setProperty('--primary', primary);
      }
      if (secondary) {
        document.documentElement.style.setProperty('--secondary', secondary);
        // Recalculer les couleurs muted basées sur la couleur secondaire
        updateMutedColors(secondary);
      }
    }
  }, []);

  // Ajouter un useEffect pour surveiller les changements de thème
  useEffect(() => {
    if (!mounted) return;
    
    // Récupérer et réappliquer les couleurs muted quand le thème change
    const savedMuted = localStorage.getItem("muted-colors");
    if (savedMuted) {
      const { hue, saturation } = JSON.parse(savedMuted);
      const mutedS = saturation * 0.3;
      const mutedL = theme === 'dark' ? 11 : 96.1;
      const mutedForegroundL = theme === 'dark' ? 56.9 : 46.9;

      const muted = `${hue} ${mutedS}% ${mutedL}%`;
      const mutedForeground = `${hue} ${mutedS * 1.3}% ${mutedForegroundL}%`;

      document.documentElement.style.setProperty('--muted', muted);
      document.documentElement.style.setProperty('--muted-foreground', mutedForeground);
    }
  }, [theme, mounted]);

  const applyThemeVariant = (variant: ThemeVariant, keepCustomColors = false) => {
    const config = themes[variant];
    const root = document.documentElement;

    // Appliquer les variables de base (radius, borderWidth)
    root.style.setProperty('--radius', config.variables.radius);
    root.style.setProperty('--border-width', config.variables.borderWidth);

    // Appliquer les couleurs par défaut seulement si keepCustomColors est false
    if (!keepCustomColors) {
      const savedColors = localStorage.getItem("custom-colors");
      const customColors = savedColors ? JSON.parse(savedColors) : {};

      // Appliquer primary seulement si pas de couleur personnalisée
      if (!customColors.primary) {
        root.style.setProperty('--primary', config.variables.defaults.primary);
      }
      
      // Appliquer secondary seulement si pas de couleur personnalisée
      if (!customColors.secondary) {
        root.style.setProperty('--secondary', config.variables.defaults.secondary);
      }
    }

    localStorage.setItem("theme-variant", variant);
    setVariant(variant);
  };

  const setCustomColor = (type: 'primary' | 'secondary') => {
    const input = document.createElement('input');
    input.type = 'color';
    
    // Récupérer la valeur HSL actuelle
    const currentHSL = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${type}`)
      .trim();
    
    // Parser la valeur HSL (format: "H S% L%")
    const [h, s, l] = currentHSL.split(' ').map(v => parseFloat(v));
    
    // Convertir HSL en RGB puis en Hex
    const [r, g, b] = hslToRGB(h, s, l);
    const hex = '#' + [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');
    
    input.value = hex;

    input.addEventListener('change', (e) => {
      const color = e.target as HTMLInputElement;
      const hsl = hexToHSL(color.value);
      const adjustedL = adjustLuminanceForContrast(hsl.h, hsl.s, hsl.l);
      const hslValue = `${hsl.h} ${hsl.s}% ${adjustedL}%`;

      // Sauvegarder la couleur personnalisée
      const savedColors = localStorage.getItem("custom-colors");
      const customColors = savedColors ? JSON.parse(savedColors) : {};
      customColors[type] = hslValue;
      localStorage.setItem("custom-colors", JSON.stringify(customColors));

      // Appliquer la couleur
      document.documentElement.style.setProperty(`--${type}`, hslValue);

      // Appliquer la couleur du texte appropriée
      document.documentElement.style.setProperty(
        `--${type}-foreground`,
        getTextColor(hsl.h, hsl.s, adjustedL) === 'light' ? '0 0% 100%' : '0 0% 0%'
      );

      // Mise à jour des couleurs muted si la couleur secondaire change
      if (type === 'secondary') {
        const mutedS = hsl.s * 0.3;
        const mutedL = theme === 'dark' ? 11 : 96.1;
        const muted = `${hsl.h} ${mutedS}% ${mutedL}%`;
        const mutedForeground = `${hsl.h} ${mutedS * 1.3}% ${theme === 'dark' ? 56.9 : 46.9}%`;
        
        document.documentElement.style.setProperty('--muted', muted);
        document.documentElement.style.setProperty('--muted-foreground', mutedForeground);
        
        // Sauvegarder les valeurs de base (teinte et saturation) au lieu des valeurs calculées
        localStorage.setItem("muted-colors", JSON.stringify({ 
          hue: hsl.h, 
          saturation: hsl.s 
        }));
      }
    });

    input.click();
  };

  // Nouvelle fonction utilitaire pour mettre à jour les couleurs muted
  const updateMutedColors = (secondaryHSL: string) => {
    const [h, s] = secondaryHSL.split(' ').map(v => parseFloat(v));
    const mutedS = s * 0.3;
    const mutedL = theme === 'dark' ? 11 : 96.1;
    const muted = `${h} ${mutedS}% ${mutedL}%`;
    const mutedForeground = `${h} ${mutedS * 1.3}% ${theme === 'dark' ? 56.9 : 46.9}%`;
    
    document.documentElement.style.setProperty('--muted', muted);
    document.documentElement.style.setProperty('--muted-foreground', mutedForeground);
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
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("theme.mode")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.style")}</DropdownMenuLabel>
        {Object.entries(themes).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => applyThemeVariant(key as ThemeVariant)}
          >
            {config.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("theme.colors")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setCustomColor('primary')}>
          <div className="w-4 h-4 rounded mr-2 bg-primary" />
          {t("theme.primaryColor")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCustomColor('secondary')}>
          <div className="w-4 h-4 rounded mr-2 bg-secondary" />
          {t("theme.secondaryColor")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation("/settings#appearance")}>
          <Settings className="h-4 w-4 mr-2" />
          {t("theme.moreSettings", "More appearance settings")}
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
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
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
    Math.round(255 * f(4))
  ];
}
