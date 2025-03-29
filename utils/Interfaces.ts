export enum Role {
    User = 0,
    Bot = 1,
    participant =2
  }
  
  export interface Message {
    id: string;
    content: string;
    senderId: string;
    isAI: boolean;
    createdAt: number;
    role: Role;
    imageUrl?: string;
    prompt?: string;
  }
  
  export interface Chat {
    id: string;
    title: string;
    type :string;
  }

  export interface User {
    userId: string;
    role: "user" | "doctor" | "dietician" | "ai";
    name?: string;
    defaultChatId?: string; // Represents v.id("chats") as a string
    busy: boolean;
    createdAt: number;
    profileDetails?: {
      email?: string;
      picture?: string;
      height?: number;
      weight?: number;
      phone?: string;
    };
  }