import { HfInference } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getToken } from "next-auth/jwt";

// Initialize Hugging Face client
const apiKey = process.env.HUGGINGFACE_API_KEY;
const client = new HfInference(apiKey);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate a unique name
const generateChatName = (input: string) => {
  const cleanInput = input.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const words = cleanInput.split(" ").slice(0, 5).join(" "); 
  return words || `Chat-${uuidv4().split("-")[0]}`;
};
export async function POST(req: NextRequest) {
  const session = await getToken({ req });

  if (!session?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { input, chatId } = await req.json();
    let out = "";

    const stream = client.chatCompletionStream({
      model: "google/gemma-2-2b-it",
      messages: [{ role: "user", content: input }],
      max_tokens: 500,
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        out += chunk.choices[0].delta.content;
      }
    }

    const userId = session.sub; // Unique user ID from NextAuth session

    if (chatId) {
      const { data, error } = await supabase
        .from("chats")
        .select("messages, user_id")
        .eq("chat_id", chatId)
        .single();

      if (error) throw error;
      if (data.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }

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
      const newChatId = uuidv4();
      const name = generateChatName(input);

      const messageData = {
        chat_id: newChatId,
        user_id: userId,
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


// get call for each id or all chats
export async function GET(req: NextRequest) {
  const session = await getToken({ req });

  if (!session?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const userId = session.sub;

    if (chatId) {
      const { data, error } = await supabase
        .from("chats")
        .select("messages, user_id")
        .eq("chat_id", chatId)
        .single();

      if (error) throw error;
      if (data.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }

      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId); // Fetch only the logged-in user's chats

      if (error) throw error;

      return new Response(JSON.stringify(data), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as any).message }), {
      status: 500,
    });
  }
}



// delete call for each id
export async function DELETE(req: NextRequest) {
  const session = await getToken({ req });

  if (!session?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Missing chatId" }), {
        status: 400,
      });
    }

    const userId = session.sub;

    // Check if chat belongs to user
    const { data, error: fetchError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("chat_id", chatId)
      .single();

    if (fetchError) throw fetchError;
    if (data.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    // Delete chat
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", userId);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Chat deleted" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as any).message }), {
      status: 500,
    });
  }
}

