import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useState } from "react";

const getOrCreateChat = useMutation(api.chats.getOrCreateChat);
const currentUser = useQuery(api.users.getCurrentUser);

const initPvtChat = async () => {
  const [chatId, setChatId] = useState<string | null>(null);

  if (!currentUser) {
    console.error("User is not authenticated");
    return;
  }
  try {
    const id = await getOrCreateChat({
      senderId: currentUser.userId as string, // Ensure userId is a string
      participantIds: [], // how to get the other participant
      isAi: false,
      type: "private",
    });
    console.log("Chat created or retrieved:", id);
    setChatId(id);
    return { chatId, setChatId };
  } catch (error) {
    console.error("Error initializing chat:", error);
  }
};

export default initPvtChat;
