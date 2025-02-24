
export type ThemeVariant = "classic" | "modern" | "soft" | "sharp" | "retro" | "cyber" | "nature";

interface ThemeConfig {
  name: string;
  variables: {
    radius: string;
    borderWidth: string;
    colors: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
}

// Valeurs HSL de base sans ajustement de contraste
export const themes: Record<ThemeVariant, ThemeConfig> = {
  classic: {
    name: "Classique",
    variables: {
      radius: "0.5rem",
      borderWidth: "1px",
      colors: {
        primary: "220 91% 54%",
        secondary: "217 91% 60%",
        muted: "220 14% 96%"
      }
    }
  },
  modern: {
    name: "Moderne",
    variables: {
      radius: "1rem",
      borderWidth: "2px",
      colors: {
        primary: "262 83% 58%",
        secondary: "316 70% 50%",
        muted: "262 14% 96%"
      }
    }
  },
  soft: {
    name: "Doux",
    variables: {
      radius: "0.75rem",
      borderWidth: "1px",
      colors: {
        primary: "169 60% 50%",
        secondary: "199 60% 50%",
        muted: "199 14% 96%"
      }
    }
  },
  sharp: {
    name: "Net",
    variables: {
      radius: "0",
      borderWidth: "2px",
      colors: {
        primary: "0 0% 40%",
        secondary: "0 0% 50%",
        muted: "0 0% 96%"
      }
    }
  },
  retro: {
    name: "Retro",
    variables: {
      radius: "0",
      borderWidth: "4px",
      colors: {
        primary: "35 92% 58%",
        secondary: "338 92% 56%",
        muted: "35 14% 96%"
      }
    }
  },
  cyber: {
    name: "Cyber",
    variables: {
      radius: "0",
      borderWidth: "2px",
      colors: {
        primary: "326 100% 50%",
        secondary: "180 100% 50%",
        muted: "326 14% 96%"
      }
    }
  },
  nature: {
    name: "Nature",
    variables: {
      radius: "0.75rem",
      borderWidth: "1px",
      colors: {
        primary: "142 72% 29%",
        secondary: "168 83% 32%",
        muted: "142 14% 96%"
      }
    }
  }
};
