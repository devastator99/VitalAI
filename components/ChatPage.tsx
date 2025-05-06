import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "convex/react";
import { useAppStore } from "~/store";
import { defaultStyles } from "~/constants/Styles";
import { Id } from "~/convex/_generated/dataModel";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Role } from "~/utils/Interfaces";
import Colors from "~/utils/Colors";

// Components
import HeaderDropDown from "~/components/HeaderDropDown";
import MessageInput from "~/components/MessageInput";
import MessageBubble from "~/components/MessageBubble";
import MessageIdeas from "~/components/MessageIdeas";
import ScrollToBottomButton from "./ScrollToBottomButton";
import FilePreview from "~/components/FilePreview";
import { LinearGradient } from "expo-linear-gradient";

// Utilities
import { fetchGeminiResponse } from "~/utils/openRouterApi";
import { usePaginatedQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";
import { fetchOpenAIResponse, fetchOpenAIStreamingResponse } from "~/utils/OpenaiApi";

const AI_USER_ID = "j576bezhm29ycwx1bh4mf7db3s7bpy6q" as Id<"users">;

//may need to localise the loading state from zustand in this chatpage

const RenderChatBubble = React.memo(
  ({ item, currentUser, participants }: { item: any; currentUser: any; participants: any }) => {
    const isCurrentUser = item.senderId === currentUser?._id;
    const senderUser = useQuery(api.users.getUserById, { id: item.senderId });

    return (
      <MessageBubble
        messageId={item._id}
        content={item.content}
        role={item.isAi ? Role.Bot : Role.User}
        isCurrentUser={isCurrentUser}
        userId={item.senderId}
        profileImage={senderUser?.profileDetails?.picture}
        type={item.type}
        attachId={item.attachId}
        readBy={item.readBy || []}
        timestamp={item._creationTime}
        participants={participants}
      />
    );
  },
  (prevProps, nextProps) => {
    // Add proper comparison for all props
    return (
      prevProps.item === nextProps.item &&
      prevProps.currentUser === nextProps.currentUser &&
      prevProps.participants === nextProps.participants
    );
  }
);

const DateSeparator = React.memo(({ timestamp }: { timestamp: number }) => {
  const formattedDate = React.useMemo(() => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }, [timestamp]);

  return (
    <View style={styles.dateSeparatorContainer}>
      <View style={styles.dateSeparatorLine} />
      <LinearGradient
        colors={[Colors.mainBlue, '#00254d']}
        style={styles.dateSeparatorBadge}
      >
        <Text style={styles.dateSeparatorText}>{formattedDate}</Text>
      </LinearGradient>
      <View style={styles.dateSeparatorLine} />
    </View>
  );
});

const ChatPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listRef = useRef<FlashList<any>>(null);
  const {
    messages,
    gptVersion,
    loading,
    showScrollToBottom,
    previewFile,
    setPreviewFile,
    setGptVersion,
    setLoading,
    setShowScrollToBottom,
    setIsNearBottom,
  } = useAppStore();

  const currentUser = useQuery(api.users.getCurrentUser);
  // Chat ID Management
  const chatId = useMemo(
    () => id || currentUser?.defaultChatId,
    [id, currentUser]
  );
  const chat = useQuery(api.chats.getChatWithParticipants, chatId ? { chatId: chatId as Id<"chats"> } : "skip");
  const participants = useMemo(() => chat?.participants || [], [chat?.participants]);
  const {
    results: queryMsgs,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.messages.getMessages,
    chatId ? { chatId } : "skip",
    { initialNumItems: 100 }
  );

  // Media Handling
  const handleMessageSubmit = useMutation(api.messages.sendMessage);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);

  // Mark messages as read when the chat is opened
  useEffect(() => {
    const markAsRead = async () => {
      if (!chatId || !currentUser || !queryMsgs) return;
      try {
        const unreadMessages = queryMsgs
          .filter(
            (msg) =>
              msg.senderId !== currentUser._id && // Exclude messages sent by current user
              (!msg.readBy || !msg.readBy.includes(currentUser._id)) // Messages not yet read by current user
          )
          .map((msg) => msg._id);

        if (unreadMessages.length > 0) {
          await markMessagesAsRead({ messageIds: unreadMessages });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markAsRead();
  }, [chatId, currentUser, queryMsgs, markMessagesAsRead]);

  // Inside the ChatPage component, add this function to handle AI responses
  const getAIResponse = useCallback(
    async (userMessage: string) => {
      if (!chatId || !currentUser) return;

      // Build "last 5" including the new user message
      const recentMessages = [
        ...queryMsgs.map((m) => ({ isAi: m.isAi, content: m.content })),
        { isAi: false, content: userMessage },
      ].slice(-5);

      // Set loading state
      setLoading(true);

      try {
        const model = gptVersion === "4" ? "gpt-4.1" : "gpt-3.5-turbo"; // Adjust model as needed

        // Call the streaming response function
        await fetchOpenAIStreamingResponse(
          recentMessages,
          (text: any) => {
            // Handle text updates
            console.log("Streaming text:", text);
            // You can update the state here to display the streaming text in the UI
          },
          () => {
            // Handle start of the response
            console.log("Streaming started");
          },
          () => {
            // Handle completion of the response
            console.log("Streaming completed");
            setLoading(false); // Stop loading when done
          },
          (error) => {
            // Handle errors
            console.error("Streaming error:", error);
            Alert.alert("Error", error);
            setLoading(false); // Stop loading on error
          },
          model
        );
      } catch (error) {
        console.error("Error getting AI response:", error);
        Alert.alert("Error", "Failed to get AI response");
        setLoading(false);
      }
    },
    [chatId, currentUser, gptVersion, queryMsgs, handleMessageSubmit]
  );

  // Message Handling
  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || !chatId || !currentUser) return;
      setLoading(true);
      try {
        await handleMessageSubmit({
          content,
          chatId: chatId as Id<"chats">,
          senderId: currentUser._id,
          isAi: false,
          type: "text",
        });

        await getAIResponse(content);
      } catch (error) {
        Alert.alert("Error", "Failed to send message");
      } finally {
        setLoading(false);
      }
    },
    [chatId, currentUser]
  );

  // Media Handling
  const handleMedia = useCallback(
    async (attachId: string, content: string) => {
      if (!chatId || !currentUser || !previewFile) return;

      setLoading(true);
      try {
        if (!attachId) return;

        await handleMessageSubmit({
          chatId: chatId as Id<"chats">,
          senderId: currentUser._id,
          isAi: false,
          content: content || "Media shared",
          type: previewFile.type === "document" ? "file" : previewFile.type,
          attachId: attachId as Id<"_storage">,
        });

        await getAIResponse(content || "Media shared");
      } catch (error) {
        Alert.alert("Error", "Failed to upload media");
      } finally {
        setLoading(false);
      }
    },
    [chatId, currentUser, previewFile]
  );

  // Scroll Handling
  const handleScroll = useCallback(({ nativeEvent }: { nativeEvent: any }) => {
    const paddingToBottom = 100;
    const { contentOffset } = nativeEvent;
    // Reverse the logic for inverted list
    const isCloseToBottom = contentOffset.y <= paddingToBottom;

    setIsNearBottom(isCloseToBottom);
    setShowScrollToBottom(!isCloseToBottom);
  }, []);

  // List Optimization
  const estimatedItemSize = 80;

  const getItemType = useCallback((item: any) => {
    return item.type;
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      // Check if we should show a date separator
      const showDateSeparator = () => {
        if (index === queryMsgs.length - 1) return true; // Show for first message
        
        const currentDate = new Date(item._creationTime).toDateString();
        const nextDate = new Date(queryMsgs[index + 1]._creationTime).toDateString();
        
        return currentDate !== nextDate;
      };

      return (
        <>
          <RenderChatBubble 
            item={item} 
            currentUser={currentUser} 
            participants={participants} 
          />
          {showDateSeparator() && (
            <DateSeparator timestamp={item._creationTime} />
          )}
        </>
      );
    },
    [currentUser, participants, queryMsgs]
  );

  return (
    <View
      style={[
        defaultStyles.pageContainer,
        { backgroundColor: "rgba(0, 0, 0, 0.2)" },
      ]}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderDropDown
              title="Cura_Base"
              items={[
                { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                { key: "4", title: "GPT-4", icon: "sparkles" },
              ]}
              onSelect={setGptVersion}
              selected={gptVersion}
            />
          ),
        }}
      />

      <View
        style={[
          styles.gradient,
          { flex: 1, backgroundColor: "rgba(0,0,0,0.95)" },
        ]}
      >
        <View style={{ flex: 1 }}>
          <FlashList
            ref={listRef}
            data={[...queryMsgs]}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            estimatedItemSize={estimatedItemSize}
            getItemType={getItemType}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyboardDismissMode="on-drag"
            removeClippedSubviews
            drawDistance={500}
            inverted={true}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState />}
            onEndReached={() => loadMore(50)}
            onEndReachedThreshold={0.5}
          />
        </View>

        {showScrollToBottom && (
          <ScrollToBottomButton
            onPress={() =>
              listRef.current?.scrollToOffset({
                offset: 0, // Keep this as 0 since we're using inverted list
                animated: true,
              })
            }
          />
        )}
      </View>

      {previewFile && (
        <FilePreview
          fileUri={previewFile.uri}
          fileType={previewFile.type}
          fileName={previewFile.name}
          attachId={previewFile.attachId || ""}
          onSend={(attachId) => {
            handleMedia(attachId, "File shared");
            setPreviewFile(null);
          }}
          onCancel={() => setPreviewFile(null)}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={63}
        style={styles.inputContainer}
      >
        {!queryMsgs?.length && <MessageIdeas onSelectCard={handleSend} />}
        {loading && (
          <ActivityIndicator
            size="small"
            color={Colors.white}
            style={styles.loadingIndicator}
          />
        )}
        <MessageInput onShouldSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Image
      source={require("~/assets/images/ring-103.gif")}
      style={styles.emptyImage}
    />
  </View>
);

const styles = StyleSheet.create({
  gradient: {
    // flex: 1,   // now applied inline
  },
  listContent: {
    paddingTop: 100,
    paddingBottom: 30,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "black",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
  },
  emptyImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  loadingIndicator: {
    marginVertical: 8,
    alignSelf: "center",
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateSeparatorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 12,
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dateSeparatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default React.memo(ChatPage);
