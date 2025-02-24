export type ColorMode = "light" | "dark" | "system";
export type BackgroundType = "none" | "image" | "video";

export interface CustomColors {
  primary?: string;
  secondary?: string;
  muted?: string;
}

export interface BackgroundConfig {
  volume: number;
  type: BackgroundType;
  url: string;
  overlay: string;
  useLightTheme?: boolean;
  isMuted?: boolean;
}

export interface ThemePreferences {
  themeMode?: ColorMode;
  themeVariant?: string;
  customColors?: CustomColors | null;
  background?: BackgroundConfig;
}
