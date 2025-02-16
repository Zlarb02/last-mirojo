import OpenAI from "openai";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable");
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateResponse(prompt: string, context: string = ""): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Tu es un maître du jeu créatif pour un jeu de rôle interactif. Le contexte du jeu est : ${context}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw new Error("Failed to generate response");
  }
}