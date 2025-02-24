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
import { BackgroundPicker } from "../background-picker";
import { useThemePreferences } from "@/hooks/use-theme-preferences";
import { BackgroundType, ColorMode, ThemePreferences } from '@/lib/client-types';
import { useQueryClient } from "@tanstack/react-query";
import { useBackground } from "@/hooks/use-background";

interface AppearanceSettingsProps {
  section?: "theme" | "colors" | "style" | "background";
}

export function AppearanceSettings({ section }: AppearanceSettingsProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences, isLoading } = useThemePreferences();
  const { updateBackground } = useBackground();
  const [variant, setVariant] = useState<ThemeVariant>("classic");
  const [uiEffects, setUiEffects] = useState(false);
  const [bgVideo, setBgVideo] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [bgType, setBgType] = useState<BackgroundType>("none");
  const [bgUrl, setBgUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [videoVolume, setVideoVolume] = useState<number>(0.5);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!preferences || isLoading) return;

    // Utiliser les préférences du serveur au lieu du localStorage
    if (preferences.themeVariant && themes[preferences.themeVariant as ThemeVariant]) {
      setVariant(preferences.themeVariant as ThemeVariant);
    }

    if (preferences.background) {
      setBgType(preferences.background.type);
      setBgUrl(preferences.background.url);
      setOverlayOpacity(Number(preferences.background.overlay));
      setIsMuted(preferences.background.isMuted ?? true); // Ajouter cette ligne
    }
  }, [preferences, isLoading]);

  const handleThemeChange = async (mode: ColorMode) => {
    try {
      // Mise à jour en base de données
      await updatePreferences({ themeMode: mode });
      
      // Mise à jour du thème local
      setTheme(mode);
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const handleVariantChange = (newVariant: ThemeVariant) => {
    // Réinitialiser les couleurs personnalisées lors du changement de variante
    updatePreferences({
      themeVariant: newVariant,
      customColors: null // Réinitialiser les couleurs personnalisées
    });
    setVariant(newVariant);
  };

  const handleColorChange = (type: "primary" | "secondary", color: string) => {
    try {
      const hsl = hexToHSL(color);
      const adjustedL = adjustLuminanceForContrast(hsl.h, hsl.s, hsl.l);
      const hslValue = `${hsl.h} ${hsl.s}% ${adjustedL}%`;

      // Mise à jour immédiate du DOM pour un retour visuel instantané
      document.documentElement.style.setProperty(
        `--${type}`,
        hslValue
      );

      // Mise à jour des préférences
      updatePreferences({
        customColors: {
          ...preferences?.customColors,
          [type]: hslValue,
        },
      });

      // Si c'est la couleur secondaire, mettre à jour les couleurs muted
      if (type === "secondary") {
        updateMutedColors(hslValue);
      }
    } catch (error) {
      console.error(`Error updating ${type} color:`, error);
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
    const colorType = variable === "--primary" ? "primary" : "secondary";
    
    try {
      // 1. D'abord essayer de récupérer la couleur depuis les préférences
      if (preferences?.customColors?.[colorType]) {
        const [h, s, l] = preferences.customColors[colorType]
          .split(" ")
          .map(v => parseFloat(v.replace("%", "")));
        
        if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          const [r, g, b] = hslToRGB(h, s, l);
          return `#${[r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')}`;
        }
      }

      // 2. Sinon utiliser la couleur du thème actuel
      const currentTheme = themes[variant];
      const [h, s, l] = currentTheme.variables.colors[colorType]
        .split(" ")
        .map(v => parseFloat(v.replace("%", "")));

      const [r, g, b] = hslToRGB(h, s, l);
      return `#${[r, g, b]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')}`;
    } catch (error) {
      console.warn(`Error getting color for ${variable}:`, error);
      // Valeurs par défaut en cas d'erreur
      return colorType === "primary" ? "#000000" : "#666666";
    }
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

  const handleOverlayChange = async (value: number) => {
    const smoothValue = (Math.pow(value, 2) * 0.98).toFixed(3);
    setOverlayOpacity(value);
    document.documentElement.style.setProperty(
      "--bg-overlay-opacity",
      smoothValue
    );

    await fetch("/api/user/theme-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        background: {
          type: bgType,
          url: bgUrl,
          overlay: value,
        },
      }),
    });
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match?.[2];
  };

  const updateBackgroundVideo = (url: string) => {
    // Supprimer l'ancienne vidéo si elle existe
    const oldVideo = document.querySelector(
      ".bg-screen video, .bg-screen iframe"
    );
    if (oldVideo) {
      oldVideo.remove();
    }

    if (!url) return;

    const youtubeId = getYoutubeVideoId(url);
    const bgScreen = document.querySelector(".bg-screen");

    if (youtubeId) {
      // Créer un iframe pour YouTube
      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&mute=${
        isMuted ? "1" : "0"
      }&loop=1&playlist=${youtubeId}&playsinline=1&disablekb=1&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`; // Ajout de enablejsapi=1
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.style.position = "fixed";
      iframe.style.top = "50%";
      iframe.style.left = "50%";
      iframe.style.minWidth = "100%";
      iframe.style.minHeight = "100%";
      iframe.style.width = "auto";
      iframe.style.height = "auto";
      iframe.style.transform = "translateX(-50%) translateY(-50%)";
      iframe.style.opacity = `calc(1 - var(--bg-overlay-opacity, 0.85))`;
      iframe.style.transition = "opacity 200ms ease-in-out";
      iframe.style.pointerEvents = "none";
      iframe.style.zIndex = "0";

      // Ajouter un identifiant unique à l'iframe
      iframe.id = "youtube-player";

      if (bgScreen) {
        bgScreen.appendChild(iframe);
      }
    } else {
      // Traiter comme une vidéo normale
      const video = document.createElement("video");
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.src = url;
      video.playsInline = true;

      if (bgScreen) {
        bgScreen.appendChild(video);
      }
    }
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Appliquer immédiatement le changement
    if (bgType === "video" && bgUrl) {
      updateBackground(bgType, bgUrl, overlayOpacity, newMutedState, videoVolume);
    }

    // Sauvegarder en base de données
    await updatePreferences({
      background: {
        type: bgType,
        url: bgUrl,
        overlay: overlayOpacity.toString(),
        isMuted: newMutedState
      }
    });

// Mettre à jour l'iframe existante si elle existe
const iframe =
document.querySelector<HTMLIFrameElement>(".bg-screen iframe");
if (iframe) {
const currentSrc = new URL(iframe.src);
currentSrc.searchParams.set("mute", newMutedState ? "1" : "0");
iframe.src = currentSrc.toString();
}
};

  const handleBackgroundChange = async (type: BackgroundType, url: string = "") => {
    setBgType(type);
    setBgUrl(url);

    // Appliquer les changements immédiatement
    updateBackground(type, url, overlayOpacity, isMuted, videoVolume);

    // Sauvegarder via l'API avec l'état muted
    await updatePreferences({
      background: {
        type,
        url,
        overlay: overlayOpacity.toString(),
        isMuted // Ajouter cette ligne
      },
    });
  };

  const handleVolumeChange = (volume: number) => {
    setVideoVolume(volume);

    const video = document.querySelector<HTMLVideoElement>(".bg-screen video");
    const iframe =
      document.querySelector<HTMLIFrameElement>(".bg-screen iframe");

    if (video) {
      video.volume = volume;
    } else if (iframe) {
      // Envoyer un message à l'iframe YouTube avec le nouveau volume
      const message = {
        event: "command",
        func: "setVolume",
        args: [Math.round(volume * 100)],
      };
      // S'assurer que le message est envoyé au bon domaine YouTube
      iframe.contentWindow?.postMessage(
        JSON.stringify(message),
        "https://www.youtube.com"
      );
    }
  };

  /*************  ✨ Codeium Command ⭐  *************/
  /**
 * Updates the overlay opacity for the background theme.
 *
 * @param {number} value - The new opacity value for the overlay.
 * 
 * This function updates the local state and applies the new overlay opacity
 * directly to the DOM. It also persists the updated opacity value by sending
/******  a9deac8c-47ac-4dea-85ed-a0db07226556  *******/
  const handleOpacityChange = async (value: number) => {
    console.log("New opacity:", value); // Debug

    // Mettre à jour l'état local immédiatement
    setOverlayOpacity(value);

    // Appliquer directement sur le DOM
    document.documentElement.style.setProperty(
      "--bg-overlay-opacity",
      value.toString()
    );

    // Attendre la fin de la mise à jour de l'état avant de sauvegarder
    await fetch("/api/user/theme-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        background: {
          type: bgType,
          url: bgUrl,
          overlay: value,
        },
      }),
    });
  };

  // Modifier la partie du rendu pour inclure la section background
  return (
    <div className="space-y-6">
      {(!section || section === "theme") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("theme.mode")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="flex flex-col items-center justify-center gap-2 h-24 bg-gray-50/80 hover:bg-muted/80 text-gray-950"
                onClick={() => handleThemeChange("light")}
              >
                <Icons.Sun className="h-6 w-6" />
                <span>{t("theme.light")}</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="flex flex-col items-center justify-center gap-2 h-24 bg-gray-950/80 hover:bg-muted/80 text-gray-50"
                onClick={() => handleThemeChange("dark")}
              >
                <Icons.Moon className="h-6 w-6" />
                <span>{t("theme.dark")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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

      {(!section || section === "style") && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("theme.style")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={variant} onValueChange={handleVariantChange}>
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
              <CardTitle>{t("theme.background.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BackgroundPicker
                selected={
                  bgUrl
                    ? { type: bgType as "image" | "video", url: bgUrl }
                    : null
                }
                onSelect={(type, url) => handleBackgroundChange(type, url)}
                onVolumeChange={handleVolumeChange}
                onOpacityChange={handleOpacityChange}
                volume={videoVolume}
                opacity={overlayOpacity} // Convertir en nombre
                currentTime={videoCurrentTime}
                duration={videoDuration}
              />

              {bgType === "video" && bgUrl && (
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <Icons.VolumeX className="h-4 w-4" />
                    ) : (
                      <Icons.Volume2 className="h-4 w-4" />
                    )}
                    <span>
                      {t(
                        isMuted
                          ? "theme.background.muteVideo"
                          : "theme.background.unmuteVideo"
                      )}
                    </span>
                  </Button>
                </div>
              )}
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

      {(!section || section === "background") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("theme.background.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BackgroundPicker
              selected={
                bgUrl ? { type: bgType as "image" | "video", url: bgUrl } : null
              }
              onSelect={(type, url) => handleBackgroundChange(type, url)}
              onVolumeChange={handleVolumeChange}
              onOpacityChange={handleOpacityChange}
              volume={videoVolume}
              opacity={overlayOpacity}
              currentTime={videoCurrentTime}
              duration={videoDuration}
            />

            {bgType === "video" && bgUrl && (
              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <Icons.VolumeX className="h-4 w-4" />
                  ) : (
                    <Icons.Volume2 className="h-4 w-4" />
                  )}
                  <span>
                    {t(
                      isMuted
                        ? "theme.background.muteVideo"
                        : "theme.background.unmuteVideo"
                    )}
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
async function updateThemePreferences({
  themeMode,
}: {
  themeMode: "light" | "dark" | "system";
}) {
  try {
    await fetch("/api/user/theme-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        themeMode,
      }),
    });
  } catch (error) {
    console.error("Failed to update theme preferences:", error);
  }
}
