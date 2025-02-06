"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import ChatInterface from "@/components/ChatInterface";
import { useRouter, useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const ChatPage = () => {
  const { chatId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<{ chat_id: string; name: string }[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const router = useRouter();

  interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
  }

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

    // Add the session token in the headers
    const fetchResponse = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ input: input, chatId }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`, // Add token here
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
          `http://localhost:3000/api/chat?chatId=${chatId}`,
          {
            headers: {
              "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`, // Add token here
            },
          }
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
  }, [chatId, session]);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("http://localhost:3000/api/chat", {
          headers: {
            "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`, // Add token here
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

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat?chatId=${chatId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.user?.accessToken ?? ""}`, // Add token here
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }

      setChats((prevChats) => prevChats.filter((chat) => chat.chat_id !== chatId));
      router.push("/");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  if (!session) {
    // If not logged in, redirect or show a login prompt
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Please log in to access the chat</h1>
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
};

export default ChatPage;
