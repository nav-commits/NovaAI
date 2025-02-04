"use client";
import ChatInterface from "@/components/ChatInterface";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export default function Home() {
  const router = useRouter();
  const [chats, setChats] = useState<{ chat_id: string; name: string }[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

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

    // Fetch response from API
    const fetchResponse = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ input: input }),
      headers: {
        "Content-Type": "application/json",
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
  // Fetch chat data from API
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("http://localhost:3000/api/chat");
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        setChats(data); // Assuming API returns an array of { chat_id, name }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, []);

  // Delete chat function
  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/chat?chatId=${chatId}`,
        {
          method: "DELETE", // Ensure the correct HTTP method
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }
      // Remove the chat from the state after successful deletion
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.chat_id !== chatId)
      );
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

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
