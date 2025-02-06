"use client";
import ChatInterface from "@/components/ChatInterface";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
    };
  }
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<{ chat_id: string; name: string }[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!session) return;

    async function fetchChats() {
      try {
        const res = await fetch("/api/chat", {
          headers: {
            "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }

    fetchChats();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const fetchResponse = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ input }),
      headers: {
        "Content-Type": "application/json",
       "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`,
      },
    });

    const { answer, chatId } = await fetchResponse.json();

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: answer,
      role: "assistant",
    };
    setMessages((prev) => [...prev, assistantMessage]);
    router.push(`chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`, {
        method: "DELETE",
        headers: {
         "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete chat");

      setChats((prevChats) =>
        prevChats.filter((chat) => chat.chat_id !== chatId)
      );
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="mb-4">Sign in to access your chats</p>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
  return (
    <Layout
      chats={chats}
      handleDeleteChat={handleDeleteChat}
      selectedChatId={selectedChatId}
      setSelectedChatId={setSelectedChatId}
    >
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={messages}
          input={input}
          handleSubmit={handleSubmit}
          setInput={setInput}
        />
      </div>
    </Layout>
  );
}
