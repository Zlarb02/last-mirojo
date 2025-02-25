import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { BackgroundType } from "@/lib/client-types";

interface BackgroundContextType {
  videoRef: React.RefObject<HTMLVideoElement>;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  updateBackground: (
    type: BackgroundType,
    url: string,
    opacity: number,
    isMuted?: boolean,
    volume?: number
  ) => void;
  updateBackgroundVideo: (
    url: string,
    isMuted?: boolean,
    volume?: number
  ) => void;
  currentTime: number;
  duration: number;
  seekTo: (time: number) => void;
}

const BackgroundContext = createContext<BackgroundContextType | null>(null);

export function BackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const youtubePlayerRef = useRef<Window | null>(null);

  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match?.[2];
  };

  const updateBackgroundVideo = (
    url: string,
    isMuted: boolean = true,
    volume: number = 0.5
  ) => {
    const container = document.querySelector(".video-background-container");
    if (!container) return;

    // Nettoyer le conteneur existant
    container.innerHTML = "";

    if (!url) return;

    const youtubeId = getYoutubeVideoId(url);

    if (youtubeId) {
      const iframe = document.createElement("iframe");

      // Optimisations YouTube
      const params = new URLSearchParams({
        autoplay: "1",
        controls: "0",
        mute: isMuted ? "1" : "0",
        loop: "1",
        playlist: youtubeId,
        playsinline: "1",
        disablekb: "1",
        modestbranding: "1",
        showinfo: "0",
        rel: "0",
        iv_load_policy: "3",
        enablejsapi: "1",
        origin: window.location.origin,
        widget_referrer: window.location.origin,
        version: "3",
        fs: "0",
        // Ajouter des paramètres pour optimiser les performances
        vq: "auto", // qualité vidéo automatique
        cc_load_policy: "0", // désactiver les sous-titres
        hl: "fr", // langue française
      });

      iframe.src = `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
      iframe.className = "youtube-background";

      // Ajouter des attributs pour optimiser les performances
      iframe.loading = "eager";
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      );

      container.appendChild(iframe);
      iframeRef.current = iframe;
    } else {
      const video = document.createElement("video");

      // Optimisations vidéo
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      video.muted = isMuted;
      video.volume = volume;
      video.preload = "auto";

      // Ajouter des attributs pour optimiser les performances
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.className = "video-background";

      // Utiliser requestVideoFrameCallback si disponible
      if ("requestVideoFrameCallback" in video) {
        (video as any).requestVideoFrameCallback(function callback() {
          if (video.readyState >= 2) {
            video.play().catch(console.error);
          }
          (video as any).requestVideoFrameCallback(callback);
        });
      }

      video.src = url;
      container.appendChild(video);
      videoRef.current = video;
    }
  };

  const updateBackground = (
    type: BackgroundType,
    url: string = "",
    opacity: number = 0.85,
    isMuted: boolean = true,
    volume: number = 0.5
  ) => {
    document.documentElement.style.removeProperty("--bg-image");

    document.documentElement.style.setProperty(
      "--bg-overlay-opacity",
      opacity.toString()
    );

    if (type === "image" && url) {
      document.documentElement.style.setProperty("--bg-image", `url(${url})`);
    } else if (type === "video" && url) {
      updateBackgroundVideo(url, isMuted, volume);
    }
  };

  const seekTo = (time: number) => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [time],
        }),
        "*"
      );
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;

      try {
        const data = JSON.parse(event.data);
        if (data.info?.currentTime) {
          setCurrentTime(data.info.currentTime);
        }
        if (data.info?.duration) {
          setDuration(data.info.duration);
        }
      } catch (e) {
        console.error("Failed to parse YouTube message:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <BackgroundContext.Provider
      value={{
        videoRef,
        iframeRef,
        updateBackground,
        updateBackgroundVideo,
        currentTime,
        duration,
        seekTo,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}
