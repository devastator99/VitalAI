import { Id } from "~/convex/_generated/dataModel";

export enum Role {
    User = 0,
    Bot = 1,
    participant =2
  }
  
  export interface Message {
    id: string;
    content: string;
    senderId: Id<"users">;
    isAI: boolean;
    createdAt: number;
    role: Role;
    type: 'text' | 'image' | 'file';
    mediaUrl?: string;
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

  export interface Habit {
    _id: string;
    name: string;
    type: HabitType;
    target?: number;
    unit?: string;
    frequency: string[];
    color: string;
    icon: string;
    entries: Entry[];
    streak: number;
    progress: { current: number; target: number };
  }

  export type HabitType = "boolean" | "numeric" | "categorical";
  export interface Entry {
  date: string;
  value: number | boolean | string;
  notes?: string;
}


export type NavParams = {
  Home: undefined;
  Photos: { images: string[]; index: number };
};