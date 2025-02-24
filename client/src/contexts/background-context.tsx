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
    const oldMedia = document.querySelector(
      ".bg-screen video, .bg-screen iframe"
    );
    if (oldMedia) oldMedia.remove();

    if (!url) return;

    const youtubeId = getYoutubeVideoId(url);
    const bgScreen = document.querySelector(".bg-screen");

    if (youtubeId && bgScreen) {
      if (iframeRef.current) iframeRef.current.remove();

      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&mute=${
        isMuted ? "1" : "0"
      }&loop=1&playlist=${youtubeId}&playsinline=1&disablekb=1&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&origin=${
        window.location.origin
      }`;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        transform: translateX(-50%) translateY(-50%);
        opacity: calc(1 - var(--bg-overlay-opacity, 0.85));
        transition: opacity 200ms ease-in-out;
        pointer-events: none;
        z-index: 0;
      `;

      iframeRef.current = iframe;
      bgScreen.appendChild(iframe);

      setTimeout(() => {
        if (iframeRef.current) {
          const player = iframeRef.current.contentWindow;
          if (player) {
            player.postMessage(
              JSON.stringify({
                event: "command",
                func: "setVolume",
                args: [Math.round(volume * 100)],
              }),
              "*"
            );
            youtubePlayerRef.current = player;
          }
        }
      }, 1000);
    } else if (bgScreen) {
      if (videoRef.current) videoRef.current.remove();

      const video = document.createElement("video");
      video.autoplay = true;
      video.loop = true;
      video.muted = isMuted;
      video.volume = volume;
      video.src = url;
      video.playsInline = true;
      video.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        transform: translateX(-50%) translateY(-50%);
        opacity: calc(1 - var(--bg-overlay-opacity, 0.85));
        transition: opacity 200ms ease-in-out;
        object-fit: cover;
        pointer-events: none;
        z-index: 0;
      `;

      videoRef.current?.remove();
      bgScreen.appendChild(video);
      videoRef.current = video;
      video.play().catch(console.error);
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
