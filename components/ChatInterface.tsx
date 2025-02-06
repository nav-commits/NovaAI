'use client'
import { useState, useRef, useEffect } from "react";
import { SendIcon, UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  status?: "typing" | "complete";
}

interface ChatInterfaceProps {
  readonly messages: Message[];
  readonly input: string;
  readonly handleSubmit: (e: React.FormEvent) => void;
  readonly setInput: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatInterface({
  messages,
  input,
  handleSubmit,
  setInput,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [chatStarted, setChatStarted] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (messages.length > 0) {
      setChatStarted(true);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {!chatStarted && (
            <div className="group flex gap-4 p-4 rounded-2xl transition-all duration-300 bg-accent/40">
              <div className="w-8 h-8 mt-1">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">Nova AI</div>
                <div className="text-sm leading-relaxed">
                  Start the conversation by typing your message!
                </div>
              </div>
            </div>
          )}
          {/* Render the messages */}
          {messages.map((message, id) => (
            <div
              key={id}
              className={cn(
                "group flex gap-4 p-4 rounded-2xl transition-all duration-300",
                message.role === "assistant"
                  ? "bg-accent/40 hover:bg-accent/60"
                  : "hover:bg-accent/20"
              )}
            >
              <div className="w-8 h-8 mt-1">
                {message.role === "assistant" ? (
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
                  {message.role === "assistant" ? "Nova AI" : "You"}
                </div>
                <div className="text-sm leading-relaxed">
                  {message.content.startsWith("```") ? (
                    <div className="overflow-x-auto max-w-full h-auto"> {/* Only horizontal scrolling */}
                      <SyntaxHighlighter
                        language="javascript"
                        style={okaidia}
                      >
                        {message.content.replace(/```/g, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">{message.content}</div>
                  )}
                </div>
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
                if (e.key === "Enter" && !e.shiftKey) {
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
  );
}
