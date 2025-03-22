import { createContext, useContext, useState } from "react";

// 1️⃣ Create Context
const ChatContext = createContext<any>(null);

// 2️⃣ Chat Provider Component (Wraps the App)
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatId, setChatId] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ chatId, setChatId }}>
      {children}
    </ChatContext.Provider>
  );
}

// 3️⃣ Hook to Use Chat Context in Components
export function useChat() {
  return useContext(ChatContext);
}
