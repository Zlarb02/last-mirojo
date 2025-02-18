import OpenAI from "openai";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable");
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateResponse(
  prompt: string,
  context: Array<{ role: string; content: string }> = []
): Promise<string> {
  try {
    // Création du contexte du chat avec les messages précédents
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "Tu es un maître du jeu créatif pour un jeu de rôle interactif. Maintiens la cohérence avec les messages précédents et l'histoire en cours.",
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

    // Requête à l'API Groq
    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Retour du message généré
    return (
      completion.choices[0]?.message?.content ??
      "Désolé, je n'ai pas pu générer une réponse."
    );
  } catch (error) {
    console.error("Error generating Groq response:", error);
    throw new Error("Failed to generate response");
  }
}
