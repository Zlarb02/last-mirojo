export interface GameEvent {
  type: string;
  value: string | number;
  display: string;
}

export function parseGameEvents(content: string): GameEvent[] {
  const eventRegex = /<event>(.*?):(.*?)<\/event>/g;
  const events: GameEvent[] = [];
  let match;

  while ((match = eventRegex.exec(content)) !== null) {
    const [_, type, value] = match;
    events.push({
      type,
      value: type === 'HEALTH' || type === 'MANA' ? parseInt(value) : value,
      display: formatEventDisplay(type, value)
    });
  }

  return events;
}

function formatEventDisplay(type: string, value: string): string {
  switch (type) {
    case 'HEALTH':
      return `Santé ${parseInt(value) > 0 ? '+' : ''}${value}`;
    case 'MANA':
      return `Mana ${parseInt(value) > 0 ? '+' : ''}${value}`;
    case 'ITEM_FOUND':
      return `Objet trouvé: ${value}`;
    case 'XP':
      return `Expérience ${parseInt(value) > 0 ? '+' : ''}${value}`;
    default:
      return `${type}: ${value}`;
  }
}

export function cleanMessageContent(content: string): string {
  return content.replace(/<event>.*?<\/event>/g, '').trim();
}
