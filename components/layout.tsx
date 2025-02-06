import { FC, useState } from "react";
import {
  Command,
  Settings,
  History,
  MessageSquareIcon,
  MoreHorizontal,
  Menu,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
interface LayoutProps {
  children: React.ReactNode;
  chats: { chat_id: string; name: string }[];
  handleDeleteChat: (chatId: string) => void;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
}

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const Layout: FC<LayoutProps> = ({
  children,
  chats,
  handleDeleteChat,
  selectedChatId,
  setSelectedChatId,
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-background p-4 flex items-center justify-between border-b border-border/20 z-50">
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-primary" />
        </button>
        <h2 className="text-lg font-semibold">Nova AI</h2>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-[300px] gradient-bg border-r border-border/20 p-4 flex-col">
        <div className="flex items-center gap-3 px-3 py-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">AI</span>
          </div>
          <Link href="/">
            <div>
              <h2 className="font-semibold text-lg">Nova AI</h2>
              <p className="text-xs text-muted-foreground">
                Quantum-Enhanced Assistant
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-end p-4 fixed top-0 right-0 z-50">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="text-primary">
                <User className="w-6 h-6" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="bg-white dark:bg-black text-black dark:text-white shadow-lg rounded-lg w-48 p-2"
            >
              <DropdownMenu.Item className="p-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-sm">
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="p-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-sm">
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="p-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-sm text-destructive dark:text-red-500"
                onClick={() => signOut()} // Sign out using NextAuth.js
              >
                Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <div className="mt-8 space-y-6 flex-grow">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-primary/60 px-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              RECENT CONVERSATIONS
            </div>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.chat_id}
                  className="flex justify-between items-center"
                >
                  <button
                    onClick={() => router.push(`/chat/${chat.chat_id}`)}
                    className="w-full hover:bg-primary/5 rounded-lg px-3 py-3 text-left text-sm flex items-center gap-3 transition-all group"
                  >
                    <MessageSquareIcon className="w-4 h-4 text-primary/60" />
                    <span className="flex-1">{chat.name}</span>
                  </button>

                  {/* Three dots menu for delete */}
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <button
                        className="w-5 h-5 text-primary/60 hover:text-primary"
                        onClick={() => setSelectedChatId(chat.chat_id)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </Dialog.Trigger>
                    {/* Delete Confirmation Dialog */}
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 bg-black/30 z-[60]" />
                      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black p-4 rounded-lg shadow-lg w-80 z-[70]">
                        <Dialog.Title className="text-lg font-semibold text-black dark:text-white">
                          Delete Chat
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-sm text-black dark:text-white">
                          Are you sure you want to delete this chat? This action
                          cannot be undone.
                        </Dialog.Description>
                        <div className="mt-4 flex justify-between">
                          <Dialog.Close asChild>
                            <Button variant="outline" className="w-1/2">
                              Cancel
                            </Button>
                          </Dialog.Close>
                          <Button
                            variant="destructive"
                            className="w-1/2"
                            onClick={() => {
                              if (selectedChatId) {
                                handleDeleteChat(selectedChatId);
                                setSelectedChatId(null);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </div>
              ))}
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

      {/* Mobile Sidebar (Slide-in) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 md:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-background p-4 shadow-lg">
            <div className="flex justify-between items-center">
              <Link href="/">
                <h2 className="font-semibold text-lg">Nova AI</h2>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>

            <div className="mt-8 space-y-6 flex-grow">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-primary/60 px-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  RECENT CONVERSATIONS
                </div>
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat.chat_id}
                      className="flex justify-between items-center"
                    >
                      <button
                        onClick={() => router.push(`/chat/${chat.chat_id}`)}
                        className="w-full hover:bg-primary/5 rounded-lg px-3 py-3 text-left text-sm flex items-center gap-3 transition-all group"
                      >
                        <MessageSquareIcon className="w-4 h-4 text-primary/60" />
                        <span className="flex-1">{chat.name}</span>
                      </button>

                      {/* Three dots menu for delete */}
                      <Dialog.Root>
                        <Dialog.Trigger asChild>
                          <button
                            className="w-5 h-5 text-primary/60 hover:text-primary"
                            onClick={() => setSelectedChatId(chat.chat_id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </Dialog.Trigger>

                        {/* Delete Confirmation Dialog */}
                        <Dialog.Portal>
                          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-[60]" />
                          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black p-4 rounded-lg shadow-lg w-80 z-[70]">
                            <Dialog.Title className="text-lg font-semibold text-black dark:text-white">
                              Delete Chat
                            </Dialog.Title>
                            <Dialog.Description className="mt-2 text-sm text-black dark:text-white">
                              Are you sure you want to delete this chat? This
                              action cannot be undone.
                            </Dialog.Description>
                            <div className="mt-4 flex justify-between">
                              <Dialog.Close asChild>
                                <Button variant="outline" className="w-1/2">
                                  Cancel
                                </Button>
                              </Dialog.Close>
                              <Button
                                variant="destructive"
                                className="w-1/2"
                                onClick={() => {
                                  if (selectedChatId) {
                                    handleDeleteChat(selectedChatId);
                                    setSelectedChatId(null);
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      </Dialog.Root>
                    </div>
                  ))}
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
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-primary">
                    <User className="w-6 h-6" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content
                  align="end"
                  className="bg-white dark:bg-black text-black dark:text-white shadow-lg rounded-lg w-48 p-2"
                >
                  <DropdownMenu.Item className="p-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-sm">
                    Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="p-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-sm">
                    Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="p-2 hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer text-sm text-destructive dark:text-red-500"
                    onClick={() => signOut()} // Sign out using NextAuth.js
                  >
                    Log Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">{children}</div>
    </div>
  );
};

export default Layout;
