// store.ts
import {create} from 'zustand';
import { Id } from './convex/_generated/dataModel';
import { Role } from './utils/Interfaces';

type Chat = any; // Replace with your actual Chat type if defined
// / Adjust based on your actual Role definition

interface Message {
  id: string;
  content: string;
  senderId: Id<"users">; // Using Convex Id type; adjust if different
  isAI: boolean;
  createdAt: number;
  role: Role;
  type: 'text' | 'image' | 'file';
  attachId?: string;
}

interface AppState {
  // User & Auth States
  userId: string | null;
  isAdmin: boolean | undefined;
  isApproved: boolean | undefined;
  detailsFilled: boolean | undefined;

  // Chat & Navigation States
  chatId: string | null;
  isInitializing: boolean;
  history: Chat[];
  message: string;

  // ChatPage Specific States
  gptVersion: string;
  height: number;
  messages: Message[];
  loading: boolean;
  refreshing: boolean;
  showScrollToBottom: boolean;
  isNearBottom: boolean;
  previewFile: {
    uri: string;
    type: 'image' | 'document';
    name?: string;
    attachId?: string;
  } | null;

  // Actions
  setUserId: (userId: string | null) => void;
  setIsAdmin: (isAdmin: boolean | undefined) => void;
  setIsApproved: (isApproved: boolean | undefined) => void;
  setDetailsFilled: (detailsFilled: boolean | undefined) => void;
  setChatId: (chatId: string | null) => void;
  setIsInitializing: (isInitializing: boolean) => void;
  setHistory: (history: Chat[]) => void;
  setMessage: (message: string) => void;
  setGptVersion: (gptVersion: string) => void;
  setHeight: (height: number) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setShowScrollToBottom: (showScrollToBottom: boolean) => void;
  setIsNearBottom: (isNearBottom: boolean) => void;
  setPreviewFile: (previewFile: {
    uri: string;
    type: 'image' | 'document';
    name?: string;
    attachId?: string;
  } | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // --- User & Auth States ---
  userId: null,
  isAdmin: undefined,
  isApproved: undefined,
  detailsFilled: undefined,

  // --- Chat & Navigation States ---
  chatId: null,
  isInitializing: false,
  history: [],
  message: '',

  // --- ChatPage Specific States ---
  gptVersion: '3.5',
  height: 0,
  messages: [],
  loading: false,
  refreshing: false,
  showScrollToBottom: false,
  isNearBottom: true,
  previewFile: null,

  // --- Actions ---
  setUserId: (userId) => set({ userId }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setIsApproved: (isApproved) => set({ isApproved }),
  setDetailsFilled: (detailsFilled) => set({ detailsFilled }),
  setChatId: (chatId) => set({ chatId }),
  setIsInitializing: (isInitializing) => set({ isInitializing }),
  setHistory: (history) => set({ history }),
  setMessage: (message) => set({ message }),
  setGptVersion: (gptVersion) => set({ gptVersion }),
  setHeight: (height) => set({ height }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setShowScrollToBottom: (showScrollToBottom) => set({ showScrollToBottom }),
  setIsNearBottom: (isNearBottom) => set({ isNearBottom }),
  setPreviewFile: (previewFile) => set({ previewFile }),

  // Reset all states to initial values
  reset: () =>
    set({
      userId: null,
      isAdmin: undefined,
      isApproved: undefined,
      detailsFilled: undefined,
      chatId: null,
      isInitializing: false,
      history: [],
      message: '',
      gptVersion: '3.5',
      height: 0,
      messages: [],
      loading: false,
      refreshing: false,
      showScrollToBottom: false,
      isNearBottom: true,
      previewFile: null,
    }),
}));