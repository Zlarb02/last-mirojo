// Convertit une couleur HSL en RGB
export function hslToRGB(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4))
  ];
}

// Convertit une couleur hexadécimale en HSL
export function hexToHSL(hex: string) {
  // Supprimer le # si présent et analyser les valeurs RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  // Convertir les valeurs hex en RGB (0-1)
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  // Trouver les valeurs min et max
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    // Calculer la saturation
    s = l > 0.5 
      ? (max - min) / (2 - max - min) 
      : (max - min) / (max + min);

    // Calculer la teinte
    switch (max) {
      case r:
        h = (g - b) / (max - min) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / (max - min) + 2;
        break;
      case b:
        h = (r - g) / (max - min) + 4;
        break;
    }
    h /= 6;
  }

  // Convertir en degrés et pourcentages
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Calcule la luminance relative selon WCAG
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calcule le rapport de contraste entre deux couleurs
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Détermine si le texte doit être clair ou foncé
export function getTextColor(h: number, s: number, l: number): 'light' | 'dark' {
  const [r, g, b] = hslToRGB(h, s, l);
  const bgLuminance = getLuminance(r, g, b);
  
  const lightTextLuminance = getLuminance(255, 255, 255);  // blanc
  const darkTextLuminance = getLuminance(0, 0, 0);         // noir
  
  const lightContrast = getContrastRatio(bgLuminance, lightTextLuminance);
  const darkContrast = getContrastRatio(bgLuminance, darkTextLuminance);

  return lightContrast > darkContrast ? 'light' : 'dark';
}

// Ajuste la luminosité pour atteindre un contraste minimum
export function adjustLuminanceForContrast(h: number, s: number, l: number): number {
  const targetContrast = 4.5; // WCAG AA standard
  let newL = l;
  const textColor = getTextColor(h, s, l);
  
  if (textColor === 'light' && l > 50) {
    // Assombrir le fond pour améliorer le contraste avec le texte blanc
    while (newL > 0) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const bgLuminance = getLuminance(r, g, b);
      const contrast = getContrastRatio(bgLuminance, getLuminance(255, 255, 255));
      if (contrast >= targetContrast) break;
      newL -= 1;
    }
  } else if (textColor === 'dark' && l < 50) {
    // Éclaircir le fond pour améliorer le contraste avec le texte noir
    while (newL < 100) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const bgLuminance = getLuminance(r, g, b);
      const contrast = getContrastRatio(bgLuminance, getLuminance(0, 0, 0));
      if (contrast >= targetContrast) break;
      newL += 1;
    }
  }
  
  return newL;
}

// Ajuster la luminosité spécifiquement pour la couleur secondaire
export function adjustSecondaryLuminance(h: number, s: number, l: number): number {
  // Pour la couleur secondaire, on veut un contraste plus subtil
  const targetContrast = 3.5; // Plus faible que le 4.5 standard
  let newL = l;
  const textColor = getTextColor(h, s, l);
  
  if (textColor === 'light' && l > 40) {
    // Assombrir avec un seuil plus bas
    while (newL > 0) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const bgLuminance = getLuminance(r, g, b);
      const contrast = getContrastRatio(bgLuminance, getLuminance(255, 255, 255));
      if (contrast >= targetContrast) break;
      newL -= 1;
    }
  } else if (textColor === 'dark' && l < 60) {
    // Éclaircir avec un seuil plus haut
    while (newL < 100) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const bgLuminance = getLuminance(r, g, b);
      const contrast = getContrastRatio(bgLuminance, getLuminance(0, 0, 0));
      if (contrast >= targetContrast) break;
      newL += 1;
    }
  }
  
  return newL;
}
