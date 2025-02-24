import { useState, useEffect } from 'react';
import { BackgroundType } from '@/lib/client-types';

export function useBackground() {
  const updateBackgroundVideo = (url: string, isMuted: boolean = true, volume: number = 0.5) => {
    const oldMedia = document.querySelector(".bg-screen video, .bg-screen iframe");
    if (oldMedia) {
      oldMedia.remove();
    }

    if (!url) return;

    const youtubeId = getYoutubeVideoId(url);
    const bgScreen = document.querySelector(".bg-screen");

    if (youtubeId && bgScreen) {
      const iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&mute=${
        isMuted ? "1" : "0"
      }&loop=1&playlist=${youtubeId}&playsinline=1&disablekb=1&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.id = "youtube-player";
      Object.assign(iframe.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        minWidth: "100%",
        minHeight: "100%",
        width: "auto",
        height: "auto",
        transform: "translateX(-50%) translateY(-50%)",
        opacity: `calc(1 - var(--bg-overlay-opacity, 0.85))`,
        transition: "opacity 200ms ease-in-out",
        pointerEvents: "none",
        zIndex: "0",
      });
      bgScreen.appendChild(iframe);

      // Initialiser le volume après un court délai
      setTimeout(() => {
        const player = iframe.contentWindow;
        if (player) {
          player.postMessage(
            JSON.stringify({
              event: "command",
              func: "setVolume",
              args: [Math.round(volume * 100)],
            }),
            "*"
          );
        }
      }, 1000);
    } else if (bgScreen) {
      const video = document.createElement("video");
      video.autoplay = true;
      video.loop = true;
      video.muted = isMuted;
      video.volume = volume;
      video.src = url;
      video.playsInline = true;
      Object.assign(video.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        minWidth: "100%",
        minHeight: "100%",
        width: "auto",
        height: "auto",
        transform: "translateX(-50%) translateY(-50%)",
        opacity: `calc(1 - var(--bg-overlay-opacity, 0.85))`,
        transition: "opacity 200ms ease-in-out",
        objectFit: "cover",
        pointerEvents: "none",
        zIndex: "0",
      });
      bgScreen.appendChild(video);
      
      // Force le démarrage de la vidéo
      video.play().catch(console.error);
    }
  };

  const updateBackground = (type: BackgroundType, url: string = "", opacity: number = 0.85, isMuted: boolean = true, volume: number = 0.5) => {
    // Nettoyer l'ancien background
    document.documentElement.style.removeProperty("--bg-image");
    const oldMedia = document.querySelector(".bg-screen video, .bg-screen iframe");
    if (oldMedia) {
      oldMedia.remove();
    }

    // Appliquer l'opacité
    document.documentElement.style.setProperty(
      "--bg-overlay-opacity",
      opacity.toString()
    );

    // Appliquer le nouveau background
    if (type === "image" && url) {
      document.documentElement.style.setProperty("--bg-image", `url(${url})`);
    } else if (type === "video" && url) {
      updateBackgroundVideo(url, isMuted, volume);
    }
  };

  return { updateBackground, updateBackgroundVideo };
}

// Utilitaire pour extraire l'ID YouTube
function getYoutubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match?.[2];
}
