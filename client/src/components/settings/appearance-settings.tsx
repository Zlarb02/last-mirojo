import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { themes, type ThemeVariant } from "@/lib/themes";
import {
  adjustSecondaryLuminance,
  getDynamicTextColor,
  hexToHSL,
  hslToRGB,
  processThemeColor,
} from "@/lib/color-utils";
import { useState, useEffect } from "react";
import { getTextColor, adjustLuminanceForContrast } from "@/lib/color-utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as Icons from "lucide-react";
import { BackgroundPicker } from "../background-picker";
import { useThemePreferences } from "@/hooks/use-theme-preferences";
import {
  BackgroundType,
  ColorMode,
  ThemePreferences,
} from "@/lib/client-types";
import { useQueryClient } from "@tanstack/react-query";
import { useBackground } from "@/hooks/use-background";
import { useLocation } from "wouter";
import {
  Box,
  Diamond,
  Cloud,
  Layers,
  Palette as PaletteIcon,
  Waves,
  Leaf,
} from "lucide-react";

interface AppearanceSettingsProps {
  section?: "theme" | "themes" | "colors" | "border" | "background";
}

const themeIcons = {
  classic: Box,
  modern: Diamond,
  soft: Cloud,
  sharp: Layers,
  retro: PaletteIcon,
  cyber: Waves,
  nature: Leaf,
} as const;

export function AppearanceSettings({ section }: AppearanceSettingsProps) {
  const { t } = useTranslation();
  const { resolvedTheme: theme, setTheme } = useTheme();
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
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!preferences || isLoading) return;

    // Utiliser les préférences du serveur au lieu du localStorage
    if (
      preferences.themeVariant &&
      themes[preferences.themeVariant as ThemeVariant]
    ) {
      const currentTheme = themes[preferences.themeVariant as ThemeVariant];
      const isDark = theme === "dark";

      if (!preferences.customColors) {
        // Si pas de couleurs personnalisées, appliquer les couleurs du thème avec ajustements
        const primaryColors = processThemeColor(
          currentTheme.variables.colors.primary,
          isDark
        );
        const secondaryColors = processThemeColor(
          currentTheme.variables.colors.secondary,
          isDark
        );

        document.documentElement.style.setProperty(
          "--primary",
          primaryColors.background
        );
        document.documentElement.style.setProperty(
          "--primary-foreground",
          primaryColors.foreground
        );
        document.documentElement.style.setProperty(
          "--secondary",
          secondaryColors.background
        );
        document.documentElement.style.setProperty(
          "--secondary-foreground",
          secondaryColors.foreground
        );
      }

      setVariant(preferences.themeVariant as ThemeVariant);
    }

    if (preferences.background) {
      setBgType(preferences.background.type);
      setBgUrl(preferences.background.url);
      setOverlayOpacity(Number(preferences.background.overlay));
      setIsMuted(preferences.background.isMuted ?? true); // Ajouter cette ligne
    }
  }, [preferences, isLoading, theme]);

  useEffect(() => {
    // Mettre à jour les valeurs de la vidéo depuis les préférences
    if (preferences?.background) {
      const bg = preferences.background;
      setBgType(bg.type);
      setBgUrl(bg.url);
      setOverlayOpacity(Number(bg.overlay));
      setIsMuted(bg.isMuted ?? true);
      setVideoVolume(bg.volume ?? 0.5);
    }

    // Initialiser l'écouteur de messages YouTube
    const handleYouTubeMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.event === "infoDelivery" || data.info) {
          const info = data.info || data;
          if (typeof info.duration === "number") {
            setVideoDuration(info.duration);
          }
          if (typeof info.currentTime === "number") {
            setVideoCurrentTime(info.currentTime);
          }
        }
      } catch (e) {
        console.error("Failed to parse YouTube message:", e);
      }
    };

    window.addEventListener("message", handleYouTubeMessage);
    return () => window.removeEventListener("message", handleYouTubeMessage);
  }, [preferences]);

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
    try {
      const themeConfig = themes[newVariant];
      const isDark = theme === "dark";

      // Appliquer le border-width et le radius
      document.documentElement.style.setProperty(
        "--border-width",
        themeConfig.variables.borderWidth
      );
      document.documentElement.style.setProperty(
        "--radius",
        themeConfig.variables.radius
      );

      // Appliquer les couleurs avec processThemeColor
      const primaryColors = processThemeColor(
        themeConfig.variables.colors.primary,
        isDark
      );
      const secondaryColors = processThemeColor(
        themeConfig.variables.colors.secondary,
        isDark
      );
      const mutedColors = processThemeColor(
        themeConfig.variables.colors.muted,
        isDark
      );

      // Appliquer toutes les couleurs
      document.documentElement.style.setProperty(
        "--primary",
        primaryColors.background
      );
      document.documentElement.style.setProperty(
        "--primary-foreground",
        primaryColors.foreground
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
        "--muted",
        mutedColors.background
      );
      document.documentElement.style.setProperty(
        "--muted-foreground",
        mutedColors.foreground
      );

      // Sauvegarder les préférences
      updatePreferences({
        themeVariant: newVariant,
        customColors: null, // Réinitialiser les couleurs personnalisées
      });
      setVariant(newVariant);
    } catch (error) {
      console.error("Failed to update theme variant:", error);
    }
  };

  const handleColorChange = (
    type: "primary" | "secondary" | "muted",
    color: string
  ) => {
    try {
      const hsl = hexToHSL(color);
      const hslString = `${hsl.h} ${hsl.s}% ${hsl.l}%`;

      // Utiliser processThemeColor pour obtenir les couleurs optimisées
      const processedColors = processThemeColor(hslString, theme === "dark");

      // Mise à jour des couleurs de fond et de texte
      document.documentElement.style.setProperty(
        `--${type}`,
        processedColors.background
      );
      document.documentElement.style.setProperty(
        `--${type}-foreground`,
        processedColors.foreground
      );

      // Mettre à jour les variables dynamiques pour le texte
      document.documentElement.style.setProperty(
        `--dynamic-${type}-foreground`,
        getDynamicTextColor(processedColors.background)
      );

      // Mise à jour des préférences
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
    // Déterminer le type de couleur à partir de la variable
    const colorType =
      variable === "--primary"
        ? "primary"
        : variable === "--secondary"
        ? "secondary"
        : "muted";

    try {
      // D'abord essayer de récupérer la couleur depuis les préférences
      if (preferences?.customColors?.[colorType]) {
        const [h, s, l] = preferences.customColors[colorType]
          .split(" ")
          .map((v) => parseFloat(v.replace("%", "")));

        if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
          const [r, g, b] = hslToRGB(h, s, l);
          return `#${[r, g, b]
            .map((x) => x.toString(16).padStart(2, "0"))
            .join("")}`;
        }
      }

      // Pour les couleurs muted, créer une version moins saturée de la couleur secondaire
      if (colorType === "muted") {
        const computedStyle = getComputedStyle(document.documentElement);
        const mutedColor = computedStyle.getPropertyValue("--muted").trim();
        if (mutedColor) {
          const [h, s, l] = mutedColor.split(" ").map((v) => parseFloat(v));
          if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
            const [r, g, b] = hslToRGB(h, s, l);
            return `#${[r, g, b]
              .map((x) => x.toString(16).padStart(2, "0"))
              .join("")}`;
          }
        }
      }

      // Sinon utiliser la couleur du thème actuel
      const currentTheme = themes[variant];
      const themeColor =
        colorType === "muted"
          ? processThemeColor(
              currentTheme.variables.colors.secondary,
              theme === "dark"
            ).background
          : currentTheme.variables.colors[colorType];

      const [h, s, l] = themeColor.split(" ").map((v) => parseFloat(v));
      const [r, g, b] = hslToRGB(h, s, l);
      return `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
    } catch (error) {
      console.warn(`Error getting color for ${variable}:`, error);
      return colorType === "primary"
        ? "#000000"
        : colorType === "secondary"
        ? "#666666"
        : "#999999";
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
      }&loop=1&playlist=${youtubeId}&playsinline=1&disablekb=1&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&origin=${
        window.location.origin
      }&widget_referrer=${window.location.origin}`; // Ajouter ces paramètres à l'URL
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

      // Ajouter un gestionnaire d'événements pour la préparation de l'iframe
      iframe.onload = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: "listening",
              id: "youtube-player",
            }),
            "https://www.youtube.com"
          );
        }
      };

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
      updateBackground(
        bgType,
        bgUrl,
        overlayOpacity,
        newMutedState,
        videoVolume
      );
    }

    // Sauvegarder en base de données
    await updatePreferences({
      background: {
        type: bgType,
        url: bgUrl,
        overlay: overlayOpacity.toString(),
        isMuted: newMutedState,
        volume: videoVolume,
      },
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

  const handleBackgroundChange = async (
    type: BackgroundType,
    url: string = ""
  ) => {
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
        isMuted,
        volume: videoVolume,
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

  const handleOpacityChange = async (value: number) => {
    setOverlayOpacity(value);
    document.documentElement.style.setProperty(
      "--bg-overlay-opacity",
      value.toString()
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

  function seekTo(time: number) {
    // Try to seek in both video and YouTube iframe elements
    const video = document.querySelector<HTMLVideoElement>(".bg-screen video");
    const iframe = document.querySelector<HTMLIFrameElement>("#youtube-player");

    if (video) {
      // For regular video elements
      video.currentTime = time;
    } else if (iframe) {
      // For YouTube iframe API
      const message = {
        event: "command",
        func: "seekTo",
        args: [time, true],
      };
      iframe.contentWindow?.postMessage(
        JSON.stringify(message),
        "https://www.youtube.com"
      );
    }
  }

  const handlePlayPause = () => {
    const iframe = document.querySelector<HTMLIFrameElement>("#youtube-player");
    if (iframe) {
      const message = {
        event: "command",
        func: isPlaying ? "pauseVideo" : "playVideo",
        args: [],
      };
      iframe.contentWindow?.postMessage(
        JSON.stringify(message),
        "https://www.youtube.com"
      );
      setIsPlaying(!isPlaying);
    }
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

      {(!section || section === "themes") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("theme.presets")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(themes).map(([key, theme]) => {
                const Icon = themeIcons[key as keyof typeof themeIcons];
                return (
                  <Button
                    key={key}
                    variant={variant === key ? "default" : "outline"}
                    className="flex flex-col items-center justify-center gap-2 h-24"
                    onClick={() => handleVariantChange(key as ThemeVariant)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{
                          background: `hsl(${theme.variables.colors.muted})`,
                          border: `${theme.variables.borderWidth} solid hsl(${theme.variables.colors.secondary})`,
                          filter: `contrast(3)`,
                        }}
                      >
                        <Icon
                          className="h-4 w-4 text-primary"
                          style={{
                            color: `hsl(${theme.variables.colors.primary})`,
                          }}
                        />
                      </div>
                      <span>{theme.name}</span>
                    </div>
                  </Button>
                );
              })}
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center gap-2 h-24"
              >
                <Icons.Plus className="h-6 w-6" />
                <span>{t("theme.custom")}</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label htmlFor="muted-color">{t("theme.mutedColor")}</Label>
                <Input
                  id="muted-color"
                  type="color"
                  className="h-10 w-full sm:w-20"
                  value={getCurrentHexColor("--muted")}
                  onChange={(e) => handleColorChange("muted", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(!section || section === "border") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("theme.borderStyle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col space-y-2">
                <Label>{t("theme.borderRadius")}</Label>
                <RadioGroup
                  defaultValue={themes[variant].variables.radius}
                  onValueChange={(value) => {
                    document.documentElement.style.setProperty(
                      "--radius",
                      value
                    );
                  }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <Label className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value="0" className="sr-only" />
                      <div className="w-12 h-12 rounded-none border-2 border-primary" />
                      <span>{t("theme.square")}</span>
                    </Label>
                    <Label className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value="0.5rem" className="sr-only" />
                      <div
                        style={{ borderRadius: "0.5rem" }}
                        className="w-12 h-12 border-2 border-primary"
                      />
                      <span>{t("theme.medium")}</span>
                    </Label>
                    <Label className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value="1rem" className="sr-only" />
                      <div className="w-12 h-12 rounded-xl border-2 border-primary" />
                      <span>{t("theme.rounded")}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>{t("theme.borderWidth")}</Label>
                <RadioGroup
                  defaultValue={themes[variant].variables.borderWidth}
                  onValueChange={(value) => {
                    document.documentElement.style.setProperty(
                      "--border-width",
                      value
                    );
                  }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <Label className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value="1px" className="sr-only" />
                      <div className="w-12 h-12 rounded-md border border-primary" />
                      <span>{t("theme.thin")}</span>
                    </Label>
                    <Label className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value="2px" className="sr-only" />
                      <div className="w-12 h-12 rounded-md border-2 border-primary" />
                      <span>{t("theme.medium")}</span>
                    </Label>
                    <Label className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value="4px" className="sr-only" />
                      <div className="w-12 h-12 rounded-md border-4 border-primary" />
                      <span>{t("theme.thick")}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
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
              onTimeChange={(time) => {
                setVideoCurrentTime(time);
                if (bgType === "video") {
                  seekTo(time);
                }
              }}
              onPlayPause={handlePlayPause}
              isPlaying={isPlaying}
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
