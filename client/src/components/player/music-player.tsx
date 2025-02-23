import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  useMusicPlayer,
  RADIO_STATIONS,
} from "@/contexts/music-player-context";
import { useEffect } from "react";

interface MusicPlayerProps {
  onClose: () => void;
}

export function MusicPlayer({ onClose }: MusicPlayerProps) {
  const {
    isPlaying,
    currentStation,
    volume,
    isMuted,
    audioRef,
    setIsPlaying,
    setCurrentStation,
    setVolume,
    setIsMuted,
    getScaledVolume, // Ajouter cette prop du contexte
  } = useMusicPlayer();

  useEffect(() => {
    if (audioRef.current) {
      const scaledVolume = getScaledVolume();
      audioRef.current.volume = isMuted ? 0 : scaledVolume;

      const handleCanPlay = () => {
        audioRef.current!.volume = isMuted ? 0 : scaledVolume;
        if (isPlaying) {
          audioRef.current?.play().catch(console.error);
        }
      };

      audioRef.current.addEventListener("canplay", handleCanPlay);
      return () => {
        audioRef.current?.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [volume, isMuted, audioRef, isPlaying, getScaledVolume]);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStationChange = (stationId: string) => {
    const station = RADIO_STATIONS.find((s) => s.id === stationId);
    if (station) {
      const wasPlaying = isPlaying;

      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentStation(station);
        audioRef.current.src = station.url;
        audioRef.current.load(); // Forcer le rechargement

        if (wasPlaying) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  };

  return (
    <div className="fixed inset-x-0 top-20 mx-auto max-w-md p-6 rounded-lg shadow-xl bg-muted/80 backdrop-blur-sm border border-border z-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Music Player</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Radio Selection */}
      <div className="space-y-4 mb-6 bg-muted/20 p-4 rounded-lg">
        <RadioGroup
          value={currentStation.id}
          onValueChange={handleStationChange}
          className="space-y-2"
        >
          {RADIO_STATIONS.map((station) => (
            <div key={station.id} className="flex items-center space-x-2">
              <RadioGroupItem value={station.id} id={station.id} />
              <Label
                htmlFor={station.id}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {station.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => {
              const index = RADIO_STATIONS.findIndex(
                (s) => s.id === currentStation.id
              );
              if (index > 0) {
                handleStationChange(RADIO_STATIONS[index - 1].id);
              }
            }}
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            onClick={handlePlay}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => {
              const index = RADIO_STATIONS.findIndex(
                (s) => s.id === currentStation.id
              );
              if (index < RADIO_STATIONS.length - 1) {
                handleStationChange(RADIO_STATIONS[index + 1].id);
              }
            }}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-full"
            onValueChange={(value) => setVolume(value[0] / 100)}
          />
        </div>
      </div>

      {/* Now Playing */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Now Playing</p>
        <p className="text-foreground font-medium">{currentStation.name}</p>
      </div>
    </div>
  );
}
