export type ThemeVariant = "classic" | "modern" | "soft" | "sharp";

interface ThemeConfig {
  name: string;
  variables: {
    radius: string;
    borderWidth: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

// Valeurs HSL de base sans ajustement de contraste
export const themes: Record<ThemeVariant, ThemeConfig> = {
  classic: {
    name: "Classique",
    variables: {
      radius: "0.375rem",
      borderWidth: "1px",
      colors: {
        primary: "222.2 47.4% 50%",     // Valeur de base
        secondary: "217.2 32.6% 50%",   // Valeur de base
      }
    }
  },
  modern: {
    name: "Moderne",
    variables: {
      radius: "1rem",
      borderWidth: "2px",
      colors: {
        primary: "246 80% 50%",         // Valeur de base
        secondary: "280 80% 50%",       // Valeur de base
      }
    }
  },
  soft: {
    name: "Doux",
    variables: {
      radius: "0.75rem",
      borderWidth: "1px",
      colors: {
        primary: "169 60% 50%",         // Valeur de base
        secondary: "199 60% 50%",       // Valeur de base
      }
    }
  },
  sharp: {
    name: "Net",
    variables: {
      radius: "0",
      borderWidth: "2px",
      colors: {
        primary: "0 0% 40%",            // Valeur de base
        secondary: "0 0% 50%",          // Valeur de base
      }
    }
  }
};
