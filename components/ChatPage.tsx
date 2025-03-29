import HeaderDropDown from "~/components/HeaderDropDown";
import MessageInput from "~/components/MessageInput";
import { defaultStyles } from "~/constants/Styles";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Button,
  StatusBar,
  SafeAreaView,
} from "react-native";
// import OpenAI from "openai";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "~/components/ChatMessage";
import { Message, Role } from "~/utils/Interfaces";
import MessageIdeas from "~/components/MessageIdeas";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import Constants from "expo-constants";
// import { streamCompletion } from "~/utils/openRouterApi";
import { useChat } from "~/utils/ChatContext";
import { useAuth } from "@clerk/clerk-expo";
import Colors from "~/constants/Colors";
import { fetchGeminiResponse } from "~/utils/openRouterApi";
import { LinearGradient } from "expo-linear-gradient";
// import { useConvexUser } from "~/utils/UserContext";
import { Id } from "~/convex/_generated/dataModel";
import MessageBubble from "~/components/MessageBubble";

const ChatPage = () => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const initaichat = useMutation(api.chats.initAiChat);
  const AI_USER_ID: Id<"users"> =
    "j576bezhm29ycwx1bh4mf7db3s7bpy6q" as Id<"users">;
  const [gptVersion, setGptVersion] = useState("3.5");
  const [height, setHeight] = useState(0);
  const [messages, setMessages] = useState<
    {
      id: string;
      content: string;
      senderId: Id<"users">;
      isAI: boolean;
      createdAt: number;
      role: Role;
    }[]
  >([]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = useMemo(() => {
    // Route param takes precedence
    if (id) return id;
    // Fall back to user's default chat
    return currentUser?.defaultChatId ?? null;
  }, [id, currentUser?.defaultChatId]);

  console.log("THIS IS THE ID PARAM IN COMPONENT");
  console.log(id);
  console.log("chat id state is :", chatId);
  // console.log(chatId);
  // console.log(chatIdRef);
  console.log("---------------------------------");

  // function setChatId(id: string) {
  //   chatIdRef.current = id;
  //   _setChatId(id);
  // }

  const [loading, setLoading] = useState(false); // Add loading state

  // useEffect(() => {
  //   if (id && id !== chatId) {
  //     console.log("Updating chatId from route param:", id);
  //     setChatId(id);
  //   }
  // }, [id]);

  // useEffect(() => {
  //   const initializeChat = async () => {
  //     if (!chatId && currentUser) {
  //       try {
  //         const newChatId = await initaichat();
  //         if (currentUser.defaultChatId!=newChatId){
  //         currentUser.defaultChatId = newChatId;};
  //         setChatId(newChatId); // Store in state to prevent re-render loops
  //         router.replace(`/(auth)/(drawer)/(ai-chat)/${newChatId}`); // Update route
  //       } catch (error) {
  //         console.error("Failed to initialize chat:", error);
  //         Alert.alert("Error", "Could not create a new chat");
  //       }
  //     }
  //   };

  //   initializeChat();
  // }, [chatId, currentUser]);

  const addMessage = useMutation(api.messages.sendMessage);

  // Move useQuery outside of useEffect
  const messagesData = useQuery(
    api.messages.getMessages,
    chatId ? { chatId } : "skip"
  );

  // useEffect(() => {
  //   initialiseChat();
  // }, []);

  // useEffect(() => {
  //   initialiseChat();
  // }, [id]);

  // Update messages state when messagesData changes
  useEffect(() => {
    if (messagesData) {
      setMessages(
        messagesData.map((msg: any) => ({
          id: msg._id,
          content: msg.content,
          senderId: msg.senderId,
          isAI: Boolean(msg.isAi),
          createdAt: msg.createdAt,
          role: msg.isAi ? Role.Bot : Role.User,
        }))
      );
    }
  }, [messagesData]);

  // useEffect(() => {
  //   if (!chatId && currentUser?.defaultChatId) {
  //     console.log("Redirecting to default chat");
  //     router.replace(`/(auth)/(drawer)/(ai-chat)/${currentUser?.defaultChatId}`);
  //   }
  // }, [chatId, currentUser]);

  // if (!key || key === "" || !organization || organization === "") {
  //   return <Redirect href={"/(auth)/(modal)/settings"} />;
  // }

  // const openAI = useMemo(() => {
  //   if (!key || key === "" || !organization || organization === "") {
  //     console.error("OpenAI API key or organization is missing");
  //     return null;
  //   }
  //   try {
  //     return new OpenAI({ apiKey: key, organization });
  //   } catch (error) {
  //     console.error("Failed to initialize OpenAI client:", error);
  //     return null;
  //   }
  // }, [key, organization]);

  // const openAI = useMemo(() => {
  //   if (!key || key === "" || !organization || organization === "") {
  //     console.warn("OpenAI credentials missing");
  //     return null;
  //   }

  //   try {
  //     const client = new OpenAI({ apiKey: key, organization });

  //     // Test the client with a simple request
  //     // client.chat.stream({
  //     //   messages: [
  //     //     {
  //     //       role: 'user',
  //     //       content: 'How do I star a repo?',
  //     //     },
  //     //   ],
  //     //   model: 'gpt-3.5-turbo',
  //     // }).catch((error:any) => {
  //     //   console.error("❌ OpenAI test request failed:", error.message);
  //     //   Alert.alert(
  //     //     "OpenAI Error",
  //     //     "Failed to connect to OpenAI. Please check your API key and organization ID."
  //     //   );
  //     // });

  //     console.log("client init openai-----");
  //     return client;
  //   } catch (error) {
  //     console.error("❌ Failed to initialize OpenAI client:", error);
  //     Alert.alert(
  //       "Configuration Error",
  //       "Failed to initialize OpenAI client. Please check your settings."
  //     );
  //     return null;
  //   }
  // }, [key, organization]);

  // useEffect(() => {
  //   if (!openAI) return;

  //   const handleNewMessage = (payload: any) => {
  //     console.log("received message chunk", payload);
  //     setMessages((prevMessages) => {
  //       // Handle empty or invalid payload
  //       if (!payload?.choices?.[0]) return prevMessages;

  //       const newMessage = payload.choices[0].delta?.content;
  //       if (newMessage) {
  //         const lastMessage = prevMessages[prevMessages.length - 1];
  //         if (!lastMessage) return prevMessages;

  //         return [
  //           ...prevMessages.slice(0, -1),
  //           { ...lastMessage, content: lastMessage.content + newMessage },
  //         ];
  //       }

  //       // Handle stream completion
  //       if (payload.choices[0].finishReason === "stop") {
  //         const lastMessage = prevMessages[prevMessages.length - 1];
  //         if (!lastMessage) return prevMessages;

  //         // Save the complete AI response to database
  //         addMessage({
  //           chatId: chatIdRef.current!,
  //           senderId: AI_USER_ID, // Use the constant instead of hardcoded value
  //           content: lastMessage.content,
  //           isAi: true,
  //           type: "text",
  //         });
  //       }
  //       return prevMessages;
  //     });
  //   };

  //   openAI.chat.addListener("onChatMessageReceived", handleNewMessage);
  //   return () => openAI.chat.removeListener("onChatMessageReceived");
  // }, [openAI, addMessage]);

  const onGptVersionChange = (version: string) => setGptVersion(version);

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height / 2);
  };

  const getCompletion = async (text: string) => {
    try {
      const isFileMessage = text.startsWith('{"assets":');
      const content = isFileMessage ? JSON.parse(text) : text;

      if (isFileMessage) {
        console.log("Received file:", content);
        return;
      }

      setLoading(true);
      if (!chatId) {
        console.error("Chat ID is missing!");
        return;
      }

      // Save user message
      const userMsgId = await addMessage({
        chatId: chatId as Id<"chats">,
        content: content,
        senderId: currentUser?._id!,
        isAi: false,
        type: "text",
      });

      // Add user message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          content: content,
          senderId: currentUser?._id!,
          isAI: false,
          createdAt: Date.now(),
          role: Role.User,
        },
      ]);

      // Get AI response
      const aiResponse = await fetchGeminiResponse(content);

      // Save AI response
      const aiMsgId = await addMessage({
        chatId: chatId as Id<"chats">,
        content: aiResponse,
        senderId: AI_USER_ID,
        isAi: true,
        type: "text",
      });

      // Add AI response to UI
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          content: aiResponse,
          senderId: AI_USER_ID,
          isAI: true,
          createdAt: Date.now(),
          role: Role.Bot,
        },
      ]);
    } catch (error) {
      console.error("Error in getCompletion:", error);
      Alert.alert("Error", "Failed to process message");
    } finally {
      setLoading(false);
    }
  };

  const RenderChatBubble = ({ item }: { item: (typeof messages)[0] }) => {
    const isCurrentUser = item.senderId === currentUser?._id;
    const senderUser = useQuery(api.users.getUserById, { id: item.senderId });

    return (
      <MessageBubble
        content={item.content}
        role={item.role}
        isCurrentUser={isCurrentUser}
        profileImage={senderUser?.profileDetails?.picture}
      />
    );
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderDropDown
              title="Cura_Base"
              items={[
                { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                { key: "4", title: "GPT-4", icon: "sparkles" },
              ]}
              onSelect={onGptVersionChange}
              selected={gptVersion}
            />
          ),
        }}
      />
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.95)", "rgba(0, 0, 0, 0.95)"]}
        style={styles.gradient}
      >
        <View style={styles.page} onLayout={onLayout}>
          {messages.length == 0 && (
            <View
              style={[styles.logoContainer, { marginTop: height / 2 - 100 }]}
            >
              <Image
                source={require("~/assets/images/ring-103.gif")}
                style={styles.image}
              />
            </View>
          )}
          <FlashList
            data={[...messages].reverse()}
            renderItem={({ item }) => <RenderChatBubble item={item} />}
            estimatedItemSize={400}
            keyboardDismissMode="on-drag"
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 150 }}
          />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={63}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "black",
        }}
      >
        {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
        <MessageInput onShouldSend={getCompletion} />
      </KeyboardAvoidingView>
    </View>
  );
};

// ListFooterComponent={<View style={{ height: 200 }} />}
// scrollIndicatorInsets={{ bottom: 150 }}
//

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  gradient: {
    flex: 1,
  },
  logoContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 50,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "cover",
  },
  page: {
    flex: 1,
    paddingTop: 5,
  },
  bubbleContainer: {
    flexDirection: "row",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  userBubbleContainer: {
    justifyContent: "flex-end",
  },
  consultantBubbleContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
  },
  consultantBubble: {
    backgroundColor: "#E5E5EA",
  },
  bubbleText: {
    color: "white",
    fontSize: 16,
  },
  consultantText: {
    color: "black",
    fontSize: 16,
  },
});

export default ChatPage;
