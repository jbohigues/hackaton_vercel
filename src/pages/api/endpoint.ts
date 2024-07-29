import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import type { APIRoute } from "astro";
import dotenv from "dotenv";

dotenv.config();

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { messages } = data;
  console.log(messages);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  streamText({
    model: groq("llama3-8b-8192"),
    system:
      "Eres el mejor y el más útil chatbot que ha existido nunca y eres un gran seguidor de Miguel Ángel Durán (midudev)",
    messages: convertToCoreMessages(messages),
  })
    .then(async (result) => {
      if (result.textStream) {
        for await (const chunk of result.textStream) {
          await writer.write(new TextEncoder().encode(chunk));
        }
      } else if (typeof result.text === "string") {
        await writer.write(new TextEncoder().encode(result.text));
      } else {
        console.error("Formato de respuesta inesperado:", result);
        await writer.write(
          new TextEncoder().encode("Error: Formato de respuesta inesperado")
        );
      }
      writer.close();
    })
    .catch((error) => {
      console.error("Error en streamText:", error);
      writer
        .write(new TextEncoder().encode("Error: " + error.message))
        .then(() => writer.close());
    });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
};
