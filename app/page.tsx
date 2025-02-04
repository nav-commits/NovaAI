import ChatInterface from "@/components/ChatInterface";
import {
  PlusIcon,
  MessageSquareIcon,
  Settings,
  Command,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
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
            {/* <div className="space-y-1">
          {[
            "Quantum Computing Basics",
            "Future Tech Trends",
            "AI Ethics Discussion",
          ].map((chat) => (
            <button
          key={chat}
          className="w-full hover:bg-primary/5 rounded-lg px-3 py-3 text-left text-sm flex items-center gap-3 transition-all group"
            >
          <MessageSquareIcon className="w-4 h-4 text-primary/60" />
          <span className="flex-1">{chat}</span>
            </button>
          ))}
        </div> */}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}
