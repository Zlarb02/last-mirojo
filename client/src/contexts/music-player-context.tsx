import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

// Fonction utilitaire pour convertir le volume linéaire en volume logarithmique
const logVolume = (value: number) => {
  const min = 0.0001; // Volume minimum pour éviter log(0)
  return Math.pow(min, 1 - value);
};

// Fonction pour convertir le volume logarithmique en linéaire
const reverseLogVolume = (value: number) => {
  const min = 0.0001;
  return 1 - Math.log(value) / Math.log(min);
};

export const RADIO_STATIONS = [
  {
    id: "lofi",
    name: "Lofi Hip Hop Radio",
    url: "https://play.streamafrica.net/lofiradio",
  },

  {
    id: "groovesalad",
    name: "Groove Salad",
    url: "http://ice.somafm.com/groovesalad",
  },
  {
    id: "dronezone",
    name: "Drone Zone",
    url: "http://ice.somafm.com/dronezone",
  },
  {
    id: "secretagent",
    name: "Secret Agent",
    url: "http://ice.somafm.com/secretagent",
  },
  {
    id: "spacestation",
    name: "Space Station Soma",
    url: "http://ice.somafm.com/spacestation",
  },
];

const VOLUME_KEY = "mirojo-player-volume";
const MUTED_KEY = "mirojo-player-muted";

interface MusicPlayerContextType {
  isPlaying: boolean;
  currentStation: (typeof RADIO_STATIONS)[0];
  volume: number;
  isMuted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  setIsPlaying: (playing: boolean) => void;
  setCurrentStation: (station: (typeof RADIO_STATIONS)[0]) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  getScaledVolume: () => number;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export function MusicPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(RADIO_STATIONS[0]);

  // Initialiser le volume à partir du localStorage avec conversion
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem(VOLUME_KEY);
    if (savedVolume === null) return 0.7;
    const parsedVolume = parseFloat(savedVolume);
    return reverseLogVolume(parsedVolume);
  });

  const [isMuted, setIsMuted] = useState(() => {
    const savedMuted = localStorage.getItem(MUTED_KEY);
    return savedMuted ? savedMuted === "true" : false;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getScaledVolume = React.useCallback(() => {
    return logVolume(volume);
  }, [volume]);

  // Sauvegarder le volume transformé
  useEffect(() => {
    const scaledVolume = logVolume(volume);
    localStorage.setItem(VOLUME_KEY, scaledVolume.toString());
  }, [volume]);

  // Persistance du mute
  useEffect(() => {
    localStorage.setItem(MUTED_KEY, isMuted.toString());
  }, [isMuted]);

  // Gestion globale de l'audio
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const scaledVolume = getScaledVolume();

      const applyVolume = () => {
        audio.volume = isMuted ? 0 : scaledVolume;
      };

      // Appliquer le volume immédiatement et lors du chargement
      applyVolume();
      audio.addEventListener("loadedmetadata", applyVolume);
      audio.addEventListener("canplay", applyVolume);

      return () => {
        audio.removeEventListener("loadedmetadata", applyVolume);
        audio.removeEventListener("canplay", applyVolume);
      };
    }
  }, [volume, isMuted, getScaledVolume]);

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        currentStation,
        volume,
        isMuted,
        audioRef,
        setIsPlaying,
        setCurrentStation,
        setVolume,
        setIsMuted,
        getScaledVolume,
      }}
    >
      <audio ref={audioRef} src={currentStation.url} />
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}
