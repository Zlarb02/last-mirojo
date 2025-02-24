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

// Ensure proper contrast ratios for default theme colors
export const themes: Record<ThemeVariant, ThemeConfig> = {
  classic: {
    name: "Classique",
    variables: {
      radius: "0.375rem",
      borderWidth: "1px",
      colors: {
        primary: "222.2 47.4% 35%",     // Adjusted for better contrast
        secondary: "217.2 32.6% 40%",   // Adjusted for better contrast
      }
    }
  },
  modern: {
    name: "Moderne",
    variables: {
      radius: "1rem",
      borderWidth: "2px",
      colors: {
        primary: "246 80% 45%",         // Adjusted for better contrast
        secondary: "280 80% 45%",       // Adjusted for better contrast
      }
    }
  },
  soft: {
    name: "Doux",
    variables: {
      radius: "0.75rem",
      borderWidth: "1px",
      colors: {
        primary: "169 60% 40%",         // Adjusted for better contrast
        secondary: "199 60% 40%",       // Adjusted for better contrast
      }
    }
  },
  sharp: {
    name: "Net",
    variables: {
      radius: "0",
      borderWidth: "2px",
      colors: {
        primary: "0 0% 20%",            // Adjusted from pure black for better contrast
        secondary: "0 0% 35%",          // Adjusted for better contrast
      }
    }
  }
};
