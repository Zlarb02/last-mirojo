import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Search, Image as ImageIcon, Video, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface BackgroundPickerProps {
  onSelect: (type: "none" | "image" | "video", url: string) => void;
  containerClassName?: string;
  selected?: { type: "image" | "video"; url: string } | null;
  onVolumeChange?: (volume: number) => void;
  onOpacityChange?: (opacity: number) => void;
  onTimeChange?: (time: number) => void;
  volume?: number;
  opacity?: number;
  currentTime?: number;
  duration?: number;
}

interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

interface UnsplashPhoto {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
}

// Exemples prédéfinis
const PRESET_BACKGROUNDS = {
  images: [
    {
      url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986",
      thumbnail:
        "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=160",
      title: "Sci-fi City",
    },
    {
      url: "https://images.unsplash.com/photo-1520034475321-cbe63696469a",
      thumbnail:
        "https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=160",
      title: "Space",
    },
    // Ajoutez d'autres images préréglées ici
  ],
  videos: [
    {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      title: "Ambient Lights",
    },
    {
      url: "https://www.youtube.com/watch?v=8TGnju6tPqw",
      thumbnail: "https://img.youtube.com/vi/8TGnju6tPqw/mqdefault.jpg",
      title: "Cyberpunk City",
    },
    // Ajoutez d'autres vidéos préréglées ici
  ],
};

export function BackgroundPicker({
  onSelect,
  containerClassName,
  selected,
  onVolumeChange = () => {},
  onOpacityChange = () => {},
  onTimeChange = () => {},
  volume = 1,
  opacity = 0.85,
  currentTime = 0,
  duration = 0,
}: BackgroundPickerProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [youtubeResults, setYoutubeResults] = useState<YoutubeVideo[]>([]);
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const searchYoutube = async (query: string) => {
    if (!query) return [];

    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche YouTube:", error);
      return [];
    }
  };

  const searchUnsplash = async (query: string) => {
    if (!query) return [];
    
    try {
      const res = await fetch(`/api/unsplash/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la recherche Unsplash:", error);
      return [];
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value.toLowerCase());
    setIsSearching(true);

    // Annuler la recherche précédente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Débounce la recherche
    searchTimeoutRef.current = setTimeout(async () => {
      if (activeTab === "video") {
        const results = await searchYoutube(value);
        setYoutubeResults(results);
      } else if (activeTab === "image") {
        const results = await searchUnsplash(value);
        setUnsplashResults(results);
      }
      setIsSearching(false);
    }, 500);
  };

  // Nettoyer le timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const filteredBackgrounds = {
    images: PRESET_BACKGROUNDS.images.filter((item) =>
      item.title.toLowerCase().includes(searchTerm)
    ),
    videos: PRESET_BACKGROUNDS.videos.filter((item) =>
      item.title.toLowerCase().includes(searchTerm)
    ),
  };

  const imageContent = searchTerm
    ? unsplashResults.map((image) => (
        <div
          key={image.id}
          className={cn(
            "group relative aspect-video cursor-pointer overflow-hidden rounded-lg",
            selected?.type === "image" && selected.url === image.url && "ring-2 ring-primary"
          )}
          onClick={() => onSelect("image", image.url)}
        >
          <img
            src={image.thumbnail}
            alt={image.title}
            className="object-cover transition-transform group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-center text-sm font-medium line-clamp-2">
              {image.title}
            </span>
          </div>
        </div>
      ))
    : filteredBackgrounds.images.map((image, index) => (
      <div
        key={index}
        className={cn(
          "group relative aspect-video cursor-pointer overflow-hidden rounded-lg",
          selected?.type === "image" &&
            selected.url === image.url &&
            "ring-2 ring-primary"
        )}
        onClick={() => onSelect("image", image.url)}
      >
        <img
          src={image.thumbnail}
          alt={image.title}
          className="object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-center text-sm font-medium">
            {image.title}
          </span>
        </div>
      </div>
    ));

  return (
    <div className={cn("flex flex-col gap-4", containerClassName)}>
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("theme.background.search")}
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isSearching && (
            <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>
        {selected && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelect("none", "")}
            title={t("theme.background.remove")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "image" | "video")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {t("theme.background.image")}
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {t("theme.background.video")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {imageContent}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <ScrollArea className="max-h-300 rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {activeTab === "video" && searchTerm
                ? youtubeResults.map((video) => (
                    <div
                      key={video.id}
                      className={cn(
                        "group relative aspect-video cursor-pointer overflow-hidden rounded-lg",
                        selected?.type === "video" &&
                          selected.url.includes(video.id) &&
                          "ring-2 ring-primary"
                      )}
                      onClick={() =>
                        onSelect(
                          "video",
                          `https://www.youtube.com/watch?v=${video.id}`
                        )
                      }
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-center text-sm font-medium line-clamp-2">
                          {video.title}
                        </span>
                      </div>
                      <Video className="absolute bottom-2 right-2 h-6 w-6 text-white opacity-75" />
                    </div>
                  ))
                : filteredBackgrounds.videos.map((video, index) => (
                    <div
                      key={index}
                      className={cn(
                        "group relative aspect-video cursor-pointer overflow-hidden rounded-lg",
                        selected?.type === "video" &&
                          selected.url === video.url &&
                          "ring-2 ring-primary"
                      )}
                      onClick={() => onSelect("video", video.url)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-center text-sm font-medium">
                          {video.title}
                        </span>
                      </div>
                      <Video className="absolute bottom-2 right-2 h-6 w-6 text-white opacity-75" />
                    </div>
                  ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder={t(`theme.background.${activeTab}Placeholder`)}
          value={selected?.url || ""}
          onChange={(e) => onSelect(activeTab, e.target.value)}
          className="flex-1"
        />
      </div>

      {selected && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Label>{t("theme.background.opacity")}</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[opacity * 100]}
              max={100}
              step={1}
              onValueChange={(value) => onOpacityChange(value[0] / 100)}
            />
          </div>

          {selected.type === "video" && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label>{t("theme.background.volume")}</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((volume || 0) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volume ? volume * 100 : 0]}
                  max={100}
                  step={1}
                  onValueChange={(value) => onVolumeChange(value[0] / 100)}
                />
              </div>

              {typeof duration === "number" && duration > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <Label>{t("theme.background.time")}</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(currentTime || 0)} / {formatTime(duration)}
                    </span>
                  </div>
                  <Slider
                    value={[currentTime || 0]}
                    max={duration}
                    step={1}
                    onValueChange={(value) => onTimeChange(value[0])}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour formater le temps
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
