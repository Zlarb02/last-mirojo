export type ThemeVariant = "classic" | "modern" | "soft" | "sharp";

interface ThemeConfig {
  name: string;
  variables: {
    radius: string;
    borderWidth: string;
    defaults: {
      primary: string;
      secondary: string;
    };
  };
}

export const themes: Record<ThemeVariant, ThemeConfig> = {
  classic: {
    name: "Classique",
    variables: {
      radius: "0.375rem",
      borderWidth: "1px",
      defaults: {
        primary: "222.2 47.4% 11.2%",
        secondary: "217.2 32.6% 17.5%",
      }
    }
  },
  modern: {
    name: "Moderne",
    variables: {
      radius: "1rem",
      borderWidth: "2px",
      defaults: {
        primary: "246 80% 60%",
        secondary: "280 80% 60%",
      }
    }
  },
  soft: {
    name: "Doux",
    variables: {
      radius: "0.75rem",
      borderWidth: "1px",
      defaults: {
        primary: "169 60% 45%",
        secondary: "199 60% 45%",
      }
    }
  },
  sharp: {
    name: "Net",
    variables: {
      radius: "0",
      borderWidth: "2px",
      defaults: {
        primary: "0 0% 0%",
        secondary: "0 0% 25%",
      }
    }
  }
};
