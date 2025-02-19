import { ScrollArea } from "@/components/ui/scroll-area";

interface GameStats {
  health: string;
  mana: string;
  level: string;
}

interface ParsedResponse {
  stats: GameStats;
  inventory: string[];
  eventLog: string[];
  message: string;
}

function parseAIResponse(content: string): ParsedResponse {
  // Extraire directement le contenu entre les balises avec des regex
  const getTagContent = (tag: string): string => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  };

  // Extraire le message complet
  const message = getTagContent('message');

  // Extraire les stats
  const stats = {
    health: getTagContent('health'),
    mana: getTagContent('mana'),
    level: getTagContent('level'),
  };

  // Extraire l'inventaire et les événements
  const extractNumberedItems = (baseTag: string): string[] => {
    const items: string[] = [];
    let i = 1;
    while (true) {
      const item = getTagContent(`${baseTag}${i}`);
      if (!item) break;
      items.push(item);
      i++;
    }
    return items;
  };

  return {
    stats,
    inventory: extractNumberedItems('item'),
    eventLog: extractNumberedItems('event'),
    message: message.replace(/\n{3,}/g, '\n\n').trim(),
  };
}

export function AIMessage({ content }: { content: string }) {
  try {
    // Vérifier et nettoyer le contenu avant le parsing
    if (!content.includes('<response>')) {
      return <div>{content}</div>;
    }

    // Extraire uniquement le contenu entre <response> et </response>
    const responseMatch = content.match(/<response>([\s\S]*?)<\/response>/);
    if (!responseMatch) {
      return <div>{content}</div>;
    }

    const parsed = parseAIResponse(responseMatch[1]);
    const hasStats = parsed.stats.health || parsed.stats.mana || parsed.stats.level;
    const hasInventory = parsed.inventory.length > 0;

    return (
      <div className="space-y-4">
        {hasStats && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            {parsed.stats.health && (
              <div>♥️ Santé: {parsed.stats.health}</div>
            )}
            {parsed.stats.mana && (
              <div>🔮 Mana: {parsed.stats.mana}</div>
            )}
            {parsed.stats.level && (
              <div>⭐ Niveau: {parsed.stats.level}</div>
            )}
          </div>
        )}
        {hasInventory && (
          <div className="text-sm text-muted-foreground">
            🎒 Inventaire: {parsed.inventory.join(', ')}
          </div>
        )}
        <div className="prose prose-sm dark:prose-invert">
          {parsed.message.split('\n').map((text, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {text}
            </p>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // En cas d'erreur, afficher le contenu brut
    return <div>{content}</div>;
  }
}
