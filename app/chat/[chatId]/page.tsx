'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { SendIcon, UserIcon, Sparkles, Command, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';

const ChatPage = () => {
  const { chatId } = useParams(); // Get the dynamic chatId from URL params
  interface Message {
    id: string;
    content: string;
    role: string;
  }
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Fetch the AI response from the API based on chatId
    const fetchResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ input: input, chatId }), // Send chatId to maintain the conversation
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { answer } = await fetchResponse.json();

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      content: answer,
      role: 'assistant',
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (

    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-[300px] gradient-bg border-r border-border/20 p-4 flex-col">
        <div className="flex items-center gap-3 px-3 py-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">AI</span>
          </div>
          <div>
            <Link href="/">
              <div>
                <h2 className="font-semibold text-lg">Nova AI</h2>
                <p className="text-xs text-muted-foreground">
                  Quantum-Enhanced Assistant
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-primary/60 px-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              RECENT CONVERSATIONS
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-primary"
          >
            <Command className="w-4 h-4" />
            Command Menu
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-primary"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <ThemeToggle />
        </div>
      </div>
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-xl font-semibold mb-4">Chat ID: {chatId}</h1>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'group flex gap-4 p-4 rounded-2xl transition-all duration-300',
                message.role === 'assistant'
                  ? 'bg-accent/40 hover:bg-accent/60'
                  : 'hover:bg-accent/20'
              )}
            >
              <div className="w-8 h-8 mt-1">
                {message.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">
                  {message.role === 'assistant' ? 'Nova AI' : 'You'}
                </div>
                <div className="text-sm leading-relaxed">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <Textarea
              placeholder="Message Nova AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              className="resize-none pr-12 text-base py-4 rounded-xl bg-accent border-accent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              size="icon"
              type="submit"
              className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300"
              disabled={!input.trim()}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Press Enter to send, Shift + Enter for new line
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default ChatPage;
