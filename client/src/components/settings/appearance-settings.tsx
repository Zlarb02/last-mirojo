import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { themes, type ThemeVariant } from "@/lib/themes";
import {
  adjustSecondaryLuminance,
  hexToHSL,
  hslToRGB,
} from "@/lib/color-utils";
import { useState, useEffect } from "react";
import { getTextColor, adjustLuminanceForContrast } from "@/lib/color-utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as Icons from "lucide-react";

interface AppearanceSettingsProps {
  section?: "theme" | "colors" | "style";
}

export function AppearanceSettings({ section }: AppearanceSettingsProps = {}) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [variant, setVariant] = useState<ThemeVariant>("classic");
  const [uiEffects, setUiEffects] = useState(false);
  const [bgVideo, setBgVideo] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState("0.75");

  useEffect(() => {
    const savedVariant = localStorage.getItem("theme-variant") as ThemeVariant;
    if (savedVariant && themes[savedVariant]) {
      setVariant(savedVariant);
    }
    setUiEffects(localStorage.getItem("ui-effects") === "true");
    setBgVideo(localStorage.getItem("bg-video") === "true");
    const savedBgImage = localStorage.getItem("bg-image") || "";
    setBgImage(savedBgImage);
    if (savedBgImage) {
      document.documentElement.style.setProperty(
        "--bg-image",
        `url(${savedBgImage})`
      );
    }
    setOverlayOpacity(localStorage.getItem("bg-overlay-opacity") || "0.75");
  }, []);

  const handleThemeVariantChange = (newVariant: string) => {
    const config = themes[newVariant as ThemeVariant];
    if (!config) return;

    const root = document.documentElement;
    root.style.setProperty("--radius", config.variables.radius);
    root.style.setProperty("--border-width", config.variables.borderWidth);

    // Sauvegarder et appliquer le nouveau variant
    localStorage.setItem("theme-variant", newVariant);
    setVariant(newVariant as ThemeVariant);
  };

  const handleColorChange = (type: "primary" | "secondary", hex: string) => {
    const hsl = hexToHSL(hex);
    const adjustedL =
      type === "primary"
        ? adjustLuminanceForContrast(hsl.h, hsl.s, hsl.l)
        : adjustSecondaryLuminance(hsl.h, hsl.s, hsl.l);
    const hslValue = `${hsl.h} ${hsl.s}% ${adjustedL}%`;

    // Sauvegarder la couleur personnalisée
    const savedColors = localStorage.getItem("custom-colors");
    const customColors = savedColors ? JSON.parse(savedColors) : {};
    customColors[type] = hslValue;
    localStorage.setItem("custom-colors", JSON.stringify(customColors));

    // Appliquer la couleur
    document.documentElement.style.setProperty(`--${type}`, hslValue);
    document.documentElement.style.setProperty(
      `--${type}-foreground`,
      getTextColor(hsl.h, hsl.s, adjustedL) === "light"
        ? "0 0% 100%"
        : "0 0% 0%"
    );

    if (type === "secondary") {
      updateMutedColors(hslValue);
    }
  };

  const updateMutedColors = (secondaryHSL: string) => {
    const [h, s] = secondaryHSL.split(" ").map((v) => parseFloat(v));
    const mutedS = s * 0.3;
    const mutedL = theme === "dark" ? 11 : 96.1;
    const muted = `${h} ${mutedS}% ${mutedL}%`;
    const mutedForeground = `${h} ${mutedS * 1.3}% ${
      theme === "dark" ? 56.9 : 46.9
    }%`;

    document.documentElement.style.setProperty("--muted", muted);
    document.documentElement.style.setProperty(
      "--muted-foreground",
      mutedForeground
    );

    localStorage.setItem(
      "muted-colors",
      JSON.stringify({ hue: h, saturation: s })
    );
  };

  const getCurrentHexColor = (variable: string) => {
    const hsl = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim()
      .split(" ")
      .map((v) => parseFloat(v));

    const [r, g, b] = hslToRGB(hsl[0], hsl[1], hsl[2]);
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const handleEffectChange = (type: "ui" | "bg", value: boolean) => {
    if (type === "ui") {
      setUiEffects(value);
      localStorage.setItem("ui-effects", value.toString());
    } else {
      setBgVideo(value);
      localStorage.setItem("bg-video", value.toString());
    }
  };

  const handleBgImageChange = (url: string) => {
    setBgImage(url);
    if (url) {
      document.documentElement.style.setProperty("--bg-image", `url(${url})`);
      localStorage.setItem("bg-image", url);
    } else {
      document.documentElement.style.removeProperty("--bg-image");
      localStorage.removeItem("bg-image");
    }
  };

  const handleOverlayChange = (value: string) => {
    const root = document.documentElement;
    setOverlayOpacity(value);
    root.style.setProperty("--bg-overlay-opacity", value);
    localStorage.setItem("bg-overlay-opacity", value);
  };

  return (
    <div className="space-y-6">
      {(!section || section === "theme") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("theme.mode")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup defaultValue={theme} onValueChange={setTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">{t("theme.light")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">{t("theme.dark")}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {(!section || section === "style") && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("theme.style")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={variant}
                onValueChange={handleThemeVariantChange}
              >
                {Object.entries(themes).map(([key, theme]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{theme.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("theme.background")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bg-image">{t("theme.backgroundImage")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={bgImage}
                    onChange={(e) => handleBgImageChange(e.target.value)}
                    className="flex-1"
                  />
                  {bgImage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBgImageChange("")}
                    >
                      <Icons.X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {bgImage && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="overlay-opacity">
                      {t("theme.overlayOpacity")}
                    </Label>
                    <div className="flex gap-4 items-center">
                      <Input
                        type="range"
                        id="overlay-opacity"
                        min="0"
                        max="1"
                        step="0.1"
                        value={overlayOpacity}
                        onChange={(e) => handleOverlayChange(e.target.value)}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">
                        {Math.round(Number(overlayOpacity) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="bg-video">
                  {t("settings.appearance.backgroundVideo")}
                </Label>
                <Switch
                  id="bg-video"
                  checked={bgVideo}
                  onCheckedChange={(checked) =>
                    handleEffectChange("bg", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance.uiEffects")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ui-effects">
                  {t("settings.appearance.uiEffectsDescription")}
                </Label>
                <Switch
                  id="ui-effects"
                  checked={uiEffects}
                  onCheckedChange={(checked) =>
                    handleEffectChange("ui", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {(!section || section === "colors") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("theme.colors")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label htmlFor="primary-color">{t("theme.primaryColor")}</Label>
                <Input
                  id="primary-color"
                  type="color"
                  className="h-10 w-full sm:w-20"
                  value={getCurrentHexColor("--primary")}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label htmlFor="secondary-color">
                  {t("theme.secondaryColor")}
                </Label>
                <Input
                  id="secondary-color"
                  type="color"
                  className="h-10 w-full sm:w-20"
                  value={getCurrentHexColor("--secondary")}
                  onChange={(e) =>
                    handleColorChange("secondary", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
