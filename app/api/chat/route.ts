import { HfInference } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Initialize Hugging Face client
const apiKey = process.env.HUGGINGFACE_API_KEY;
const client = new HfInference(apiKey);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate a unique name
const generateUniqueName = () => {
  const words = ['AI', 'User', 'Bot', 'Helper', 'Assistant']; // Possible prefixes
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomString = uuidv4().split('-')[0]; // Get the first part of UUID for uniqueness
  return `${randomWord}-${randomString}`;
};

export async function POST(req: NextRequest) {
  try {
    const { input, chatId } = await req.json();
    let out = "";

    // Call Hugging Face model API
    const stream = client.chatCompletionStream({
      model: "google/gemma-2-2b-it",
      messages: [{ role: "user", content: input }],
      max_tokens: 500,
    });

    // Wait for the stream to return content
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        out += chunk.choices[0].delta.content;
      }
    }

    // Check if chatId exists in database
    if (chatId) {
      // Append message to existing chat
      const { data, error } = await supabase
        .from("chats")
        .select("messages")
        .eq("chat_id", chatId)
        .single();

      if (error) throw error;

      const updatedMessages = [
        ...data.messages,
        { role: "user", content: input },
        { role: "assistant", content: out },
      ];

      const { error: updateError } = await supabase
        .from("chats")
        .update({ messages: updatedMessages })
        .eq("chat_id", chatId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ chatId, answer: out }), {
        status: 200,
      });
    } else {
      // Generate new chat ID and save new conversation
      const newChatId = uuidv4();
      const name = generateUniqueName();

      const messageData = {
        chat_id: newChatId,
        name,
        messages: [
          { role: "user", content: input },
          { role: "assistant", content: out },
        ],
      };

      const { error: insertError } = await supabase
        .from("chats")
        .insert([messageData]);

      if (insertError) throw insertError;

      return new Response(JSON.stringify({ chatId: newChatId, answer: out }), {
        status: 200,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as any).message }), {
      status: 500,
    });
  }
}
