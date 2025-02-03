import { HfInference } from "@huggingface/inference";
const apiKey = process.env.HUGGINGFACE_API_KEY ;

const client = new HfInference(apiKey);
import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    let out = "";

    const stream = client.chatCompletionStream({
      model: "google/gemma-2-2b-it",
      messages: [
        { role: "user", content: input },
      ],
      max_tokens: 500, // Adjust token limit as needed
    });

    // Wait for the stream to return content
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        out += newContent;
        console.log(newContent); // Debugging output
      }
    }
    // Return the accumulated output as the response
    return new Response(JSON.stringify({ answer: out }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);

    // Return an error response to the client
    return new Response(
      JSON.stringify({
        error: "Error calling the Hugging Face model",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
