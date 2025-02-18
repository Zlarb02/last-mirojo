import OpenAI from "openai";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable");
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

interface GameContext {
  stats?: {
    health: number;
    mana: number;
    level: number;
    [key: string]: any;
  };
  inventory?: any[];
  eventLog?: any[];
}

export async function generateResponse(
  prompt: string,
  context: Array<{ role: string; content: string }> = [],
  gameContext?: GameContext
): Promise<string> {
  try {
    // Création d'un résumé du contexte du jeu
    const gameStatePrompt = gameContext
      ? `
État actuel du personnage:
- Santé: ${gameContext.stats?.health}/100
- Mana: ${gameContext.stats?.mana}/100
- Niveau: ${gameContext.stats?.level}

Inventaire: ${
          gameContext.inventory?.length
            ? gameContext.inventory.join(", ")
            : "vide"
        }

Derniers événements: ${
          gameContext.eventLog?.slice(-3).join(" → ") ||
          "Aucun événement récent"
        }
`
      : "";

    // Prompt système amélioré
    const systemPrompt = `Tu es un maître du jeu créatif pour une aventure interactive de fantasy/sci-fi. Tu dois:

1. Maintenir la cohérence narrative avec l'histoire en cours et l'état du personnage
2. Réagir aux actions du joueur en tenant compte des statistiques et de l'inventaire
3. Créer des situations qui permettent d'utiliser les objets de l'inventaire
4. Proposer des choix qui influencent les stats du personnage
5. Générer des réponses de 2-3 paragraphes maximum
6. Terminer occasionnellement par des choix subtils ou une question ouverte

${gameStatePrompt}

Format suggéré pour les événements importants:
<event>TYPE:DÉTAIL</event> (ex: <event>DAMAGE:10</event>, <event>ITEM_FOUND:potion</event>)`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...context.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return (
      completion.choices[0]?.message?.content ??
      "Désolé, je n'ai pas pu générer une réponse."
    );
  } catch (error) {
    console.error("Error generating Groq response:", error);
    throw new Error("Failed to generate response");
  }
}
