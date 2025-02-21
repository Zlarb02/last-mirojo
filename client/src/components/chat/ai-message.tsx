import { StatDisplay } from "../game/stat-display";

interface GameStats {
  name: string;
  value: string;
  config: any;
}

interface ParsedResponse {
  stats: GameStats[];
  inventory: string[];
  eventLog: string[];
  message: string;
  characterName?: string;
  characterDescription?: string;
  mainQuest?: {
    title: string;
    description: string;
  };
  sideQuests?: {
    title: string;
    description: string;
  }[];
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

  const stats = extractNumberedItems('stat').map(stat => ({
    name: getTagContent(`stat${stat}/name`),
    value: getTagContent(`stat${stat}/value`),
    config: JSON.parse(getTagContent(`stat${stat}/config`))
  }));
  
  const characterName = getTagContent('characterName');
  const characterDescription = getTagContent('characterDescription');
  const mainQuest = {
    title: getTagContent('mainQuest/title'),
    description: getTagContent('mainQuest/description')
  };
  const sideQuests = extractNumberedItems('sideQuest').map(quest => ({
    title: getTagContent(`sideQuest${quest}/title`),
    description: getTagContent(`sideQuest${quest}/description`)
  }));

  return {
    stats,
    inventory: extractNumberedItems('item'),
    eventLog: extractNumberedItems('event'),
    characterName,
    characterDescription,
    mainQuest,
    sideQuests,
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

    return (
      <div className="space-y-4">
        {parsed.characterName && (
          <div className="text-sm font-medium">
            👤 {parsed.characterName}
            {parsed.characterDescription && (
              <p className="text-sm text-muted-foreground mt-1">{parsed.characterDescription}</p>
            )}
          </div>
        )}
        {parsed.stats.length > 0 && (
          <div className="space-y-2">
            {parsed.stats.map((stat, index) => (
              <StatDisplay key={index} stat={stat} />
            ))}
          </div>
        )}
        {parsed.mainQuest?.title && (
          <div className="text-sm">
            📜 Quête: {parsed.mainQuest.title}
            <p className="text-sm text-muted-foreground mt-1">{parsed.mainQuest.description}</p>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          🎒 Inventaire: {parsed.inventory.length > 0 ? parsed.inventory.join(', ') : 'Aucun objet'}
        </div>
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
