import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import dotenv from "dotenv";

// Types
import type { APIRoute } from "astro";
import type { Message } from "../../interfaces/interfaces";

dotenv.config();

// Configuración de Groq
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Prompt del sistema
const SYSTEM_PROMPT = `Eres un narrador experto en crear historias interactivas con mucha imaginación y aleatoriedad. 
Tu tarea es generar una historia basada en la temática proporcionada por el usuario y ofrecer 3 opciones para continuar la historia. 
Cada vez que el usuario elige una opción, debes continuar la historia en base a esa elección.

IMPORTANTE: la respuesta que debes dar SIEMPRE es este formato JSON:
{
  "history": ["Primer párrafo de la historia", "Segundo párrafo de la historia", "Tercer párrafo de la historia"],
  "options": [
    {"id": "1", "text": "Descripción de la opción 1"},
    {"id": "2", "text": "Descripción de la opción 2"},
    {"id": "3", "text": "Descripción de la opción 3"}
  ]
}

- La historia debe estar en Castellano y sin faltas de ortografía.
- Si no hay opciones, "options" debe ser un array vacío.
- No incluyas ningún texto fuera de esta estructura JSON.
- El JSON tiene que estar perfectamente formado, con su "history" y sus "options".

ADVERTENCIA: debes evitar todos los SyntaxError posibles, eso implica construir y terminar los JSON de forma perfecta.
`;

export const POST: APIRoute = async ({ request }) => {
  const { messages }: { messages: Message[] } = await request.json();

  const response = await streamText({
    model: groq("llama3-8b-8192"),
    system: SYSTEM_PROMPT,
    messages: convertToCoreMessages(messages),
    temperature: 0.7,
    frequencyPenalty: 0.7,
  });

  return response.toTextStreamResponse();
};
