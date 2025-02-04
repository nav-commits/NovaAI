"use client";

import { useParams} from "next/navigation";
import { useState,useEffect } from "react";
import Layout from "@/components/layout";
import ChatInterface from "@/components/ChatInterface";

const ChatPage = () => {
  const { chatId } = useParams();
  interface Message {
    id: string;
    content: string;
    role: "user" | "assistant"; // Add the role to the Message interface
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<{ chat_id: string; name: string }[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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

    const fetchResponse = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ input: input, chatId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { answer } = await fetchResponse.json();

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: answer,
      role: "assistant",
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  useEffect(() => {
    const fetchChatById = async () => {
      if (!chatId) return;

      try {
        const res = await fetch(
          `http://localhost:3000/api/chat?chatId=${chatId}`
        );
        if (!res.ok) {
          console.error("Failed to fetch:", res.statusText);
          throw new Error("Failed to fetch chat");
        }
        const data = await res.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching chat by ID:", error);
      }
    };
    fetchChatById();
  }, [chatId]);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("http://localhost:3000/api/chat");
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, []);

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat?chatId=${chatId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }

      setChats((prevChats) => prevChats.filter((chat) => chat.chat_id !== chatId));
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
};

export default ChatPage;
