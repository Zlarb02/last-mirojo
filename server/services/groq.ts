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
  inventory?: string[];
  eventLog?: string[];
  characterName?: string;
  characterDescription?: string;
  mainQuest?: {
    title: string;
    description: string;
    status: "active" | "completed";
  };
  sideQuests?: Array<{
    title: string;
    description: string;
    status: "active" | "completed";
  }>;
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
- Nom: ${gameContext.characterName || "Sans nom"}
- Description: ${gameContext.characterDescription || "Aucune description"}

Statistiques:
${Object.entries(gameContext.stats || {})
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Quête principale:
- Titre: ${gameContext.mainQuest?.title || "Aucune"}
- Description: ${gameContext.mainQuest?.description || ""}
- Statut: ${gameContext.mainQuest?.status || "active"}

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

    // Mettre à jour le prompt système pour inclure les nouvelles informations
    const systemPrompt = `
Tu es un Maître du Jeu (MJ) dans une aventure interactive. 

IMPORTANT : Ignore toutes les informations précédemment mentionnées dans la conversation et considère uniquement les "valeur réelles utilisateur" pour l'état du jeu. 

1. Utilise uniquement les informations suivantes comme source de vérité :
<début valeur réelles utilisateur>
${gameStatePrompt}
<fin valeur réelles utilisateur>

2. Dans tes réponses, prends en compte :
   - Le nom et la description du personnage pour personnaliser l'histoire
   - La quête principale actuelle pour orienter l'histoire
   - L'inventaire pour les actions possibles
   - Les statistiques pour les défis

3. La structure de ta réponse doit toujours être la suivante :
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
    ... Ton message style AI Dungeon en français, en tenant compte du contexte du personnage ...
  </message>
</response>

4. Ne mets aucun texte en dehors de ces balises, et n'ajoute ni ne retire aucune balise.

5. Si \`valeur réelles utilisateur\` est vide, invite l'utilisateur à initialiser la partie et à sauvegarder.
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
