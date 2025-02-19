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
    // Création d'un résumé du contexte du jeu plus détaillé
    const gameStatePrompt = gameContext
      ? `
État actuel du personnage:
${Object.entries(gameContext.stats || {})
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

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
    const systemPrompt = `Tu es un maître du jeu pour une aventure interactive avec des règles strictes:

voici les réelles données du jeu mise à jour que l'utilisateur à validé:
<début valeur réelles utilisateur>
${gameStatePrompt}
<fin valeur réelles utilisateur>
if and only if valeur réelles utilisateur is empty, wait to user init the game to fill it, advise him to the save the game to start.

Ta réponse sera toujours structuré de la même manière. C'est très important pour la gestion du jeu dans l'application qui se base sur ce système de balises pour l'affichage et le dynamisme des données. En aucun cas tu ne dois modifier la structure de la réponse. Voici la structure de la réponse attendue:

<response>
<stats>
<health></health>
<mana></mana>
<level></level>
</stats>
<inventory>
<item1></item1>
<item2></item2>
</inventory>
<eventLog>
<event1></event1>
<event2></event2>
</eventLog>
<message>
... ton message style ai dungeon en français ... 

You can use empty lines to create paragraphs in your message.
Each new line will be displayed as a line break in the chat.
</message>
</response>

Important: Use empty lines between paragraphs in your message for better readability. The chat will preserve these line breaks.
`;

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

    console.log("gameStatePrompt", gameStatePrompt);
    return (
      completion.choices[0]?.message?.content ??
      "Désolé, je n'ai pas pu générer une réponse."
    );
  } catch (error) {
    console.error("Error generating Groq response:", error);
    throw new Error("Failed to generate response");
  }
}
