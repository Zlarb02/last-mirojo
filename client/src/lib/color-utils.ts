// Convertit une couleur HSL en RGB
export function hslToRGB(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  // Convertir les pourcentages en décimaux
  s = s / 100;
  l = l / 100;
  h = h % 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (h >= 300 && h < 360) {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Convertit une couleur hexadécimale en HSL
export function hexToHSL(hex: string) {
  // Supprimer le # si présent
  hex = hex.replace(/^#/, '');

  // Convertir en RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Convertir RGB en HSL
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case normalizedR:
        h = (normalizedG - normalizedB) / d + (normalizedG < normalizedB ? 6 : 0);
        break;
      case normalizedG:
        h = (normalizedB - normalizedR) / d + 2;
        break;
      case normalizedB:
        h = (normalizedR - normalizedG) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Amélioration du calcul de la luminance relative
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Amélioration du calcul du rapport de contraste avec plus de précision
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Détermine si le texte doit être clair ou foncé
export function getTextColor(
  h: number,
  s: number,
  l: number
): "light" | "dark" {
  const [r, g, b] = hslToRGB(h, s, l);
  const bgLuminance = getLuminance(r, g, b);

  const lightTextLuminance = getLuminance(255, 255, 255); // blanc
  const darkTextLuminance = getLuminance(0, 0, 0); // noir

  const lightContrast = getContrastRatio(bgLuminance, lightTextLuminance);
  const darkContrast = getContrastRatio(bgLuminance, darkTextLuminance);

  return lightContrast > darkContrast ? "light" : "dark";
}

// Nouvelle fonction pour ajuster la teinte pour un meilleur contraste
function adjustHueForContrast(h: number, s: number, l: number): number {
  let bestHue = h;
  let maxContrast = 0;

  // Tester différents décalages de teinte pour trouver le meilleur contraste
  for (let offset = 0; offset <= 60; offset += 15) {
    const huePositive = (h + offset) % 360;
    const hueNegative = (h - offset + 360) % 360;

    const [r1, g1, b1] = hslToRGB(huePositive, s, l);
    const [r2, g2, b2] = hslToRGB(hueNegative, s, l);

    const contrastPositive = getContrastRatio(
      getLuminance(r1, g1, b1),
      getLuminance(255, 255, 255)
    );
    const contrastNegative = getContrastRatio(
      getLuminance(r2, g2, b2),
      getLuminance(255, 255, 255)
    );

    if (contrastPositive > maxContrast) {
      maxContrast = contrastPositive;
      bestHue = huePositive;
    }
    if (contrastNegative > maxContrast) {
      maxContrast = contrastNegative;
      bestHue = hueNegative;
    }
  }

  return bestHue;
}

// Amélioration de la fonction d'ajustement de la luminosité
export function adjustLuminanceForContrast(
  h: number,
  s: number,
  l: number,
  forText: boolean = false // nouveau paramètre
): number {
  const minContrast = 4.5;
  let newL = l;
  const textColor = getTextColor(h, s, l);

  // Si on ajuste pour le texte, on inverse la logique
  if (forText) {
    return textColor === "light" ? 95 : 15; // Forcer le texte à être très clair ou très foncé
  }

  // Pour le fond, on s'assure que la couleur contraste avec le texte qui sera utilisé
  if (textColor === "light") {
    // Si le texte doit être clair, le fond doit être assez foncé
    while (newL > 0) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const contrast = getContrastRatio(
        getLuminance(r, g, b),
        getLuminance(255, 255, 255)
      );
      if (contrast >= minContrast) break;
      newL -= 2;
    }
  } else {
    // Si le texte doit être foncé, le fond doit être assez clair
    while (newL < 100) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const contrast = getContrastRatio(
        getLuminance(r, g, b),
        getLuminance(0, 0, 0)
      );
      if (contrast >= minContrast) break;
      newL += 2;
    }
  }

  return Math.max(0, Math.min(100, newL));
}

// Amélioration de l'ajustement pour la couleur secondaire
export function adjustSecondaryLuminance(
  h: number,
  s: number,
  l: number
): number {
  const minContrast = 3.5;
  const targetContrast = 5; // Augmenté pour une meilleure lisibilité
  let newL = l;
  const textColor = getTextColor(h, s, l);

  // Ajuster la saturation si nécessaire pour améliorer le contraste
  const adjustedS = s > 70 ? 70 : s; // Limiter la saturation maximale

  if (textColor === "light") {
    while (newL > 0) {
      const [r, g, b] = hslToRGB(h, adjustedS, newL);
      const contrast = getContrastRatio(
        getLuminance(r, g, b),
        getLuminance(255, 255, 255)
      );
      if (contrast >= targetContrast) break;
      newL -= 2;
    }
  } else {
    while (newL < 100) {
      const [r, g, b] = hslToRGB(h, adjustedS, newL);
      const contrast = getContrastRatio(
        getLuminance(r, g, b),
        getLuminance(0, 0, 0)
      );
      if (contrast >= targetContrast) break;
      newL += 2;
    }
  }

  return Math.max(0, Math.min(100, newL));
}

// Nouvelle fonction pour calculer la luminosité pour les contrôles interactifs
export function adjustControlLuminance(
  h: number,
  s: number,
  l: number,
  isDark: boolean
): number {
  // Pour les contrôles interactifs, on veut un contraste plus élevé
  const targetContrast = 5.5; // Plus élevé pour une meilleure lisibilité
  let newL = l;

  if (isDark) {
    // En mode sombre, on veut des contrôles plus lumineux
    while (newL < 100) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const bgLuminance = getLuminance(r, g, b);
      const contrast = getContrastRatio(bgLuminance, getLuminance(0, 0, 0));
      if (contrast >= targetContrast) break;
      newL += 1;
    }
  } else {
    // En mode clair, on veut des contrôles plus sombres
    while (newL > 0) {
      const [r, g, b] = hslToRGB(h, s, newL);
      const bgLuminance = getLuminance(r, g, b);
      const contrast = getContrastRatio(
        bgLuminance,
        getLuminance(255, 255, 255)
      );
      if (contrast >= targetContrast) break;
      newL -= 1;
    }
  }

  return newL;
}

// Mise à jour de la fonction processThemeColor
export function processThemeColor(hslString: string, isDark: boolean): { 
  background: string;
  foreground: string;
  hover: string;
} {
  const [h, s, l] = hslString.split(' ').map(v => parseFloat(v));
  
  // Ajuster la luminosité du fond en fonction du mode
  const bgL = isDark ? 
    Math.min(45, l) : // En mode sombre, limiter la luminosité maximale
    Math.max(55, l);  // En mode clair, assurer une luminosité minimale

  // Réduire la saturation pour les fonds en mode clair
  const bgS = isDark ? s : Math.min(s, 85);

  // Calculer la luminosité du texte pour un contraste optimal
  const fgL = isDark ? 90 : 10;
  
  // Créer une couleur de survol avec un contraste légèrement différent
  const hoverL = isDark ? 
    Math.min(bgL + 10, 60) : // Plus clair en mode sombre
    Math.max(bgL - 10, 45);  // Plus sombre en mode clair

  return {
    background: `${h} ${bgS}% ${bgL}%`,
    foreground: `${h} ${Math.min(s, 15)}% ${fgL}%`,
    hover: `${h} ${bgS}% ${hoverL}%`
  };
}

// Ajout d'une nouvelle fonction pour calculer les couleurs des boutons
export function processButtonColors(hslString: string, isDark: boolean): {
  bg: string;
  text: string;
  hover: string;
  active: string;
} {
  const [h, s, l] = hslString.split(' ').map(v => parseFloat(v));
  
  // Ajuster la saturation pour éviter les couleurs trop vives
  const adjustedS = Math.min(s, 70);
  
  // Calculer la luminosité de base pour le fond
  let bgL = isDark ? 35 : 65;
  
  // Assurer un contraste minimal avec le texte
  const textL = isDark ? 95 : 15;
  
  // Calculer les états hover et active
  const hoverL = isDark ? bgL + 10 : bgL - 10;
  const activeL = isDark ? bgL + 5 : bgL - 5;

  return {
    bg: `${h} ${adjustedS}% ${bgL}%`,
    text: `${h} 15% ${textL}%`,
    hover: `${h} ${adjustedS}% ${hoverL}%`,
    active: `${h} ${adjustedS}% ${activeL}%`
  };
}
