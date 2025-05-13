import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Text,
  Animated,
} from "react-native";
import Image from "@d11/react-native-fast-image";
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
import BirdVector from "~/components/BirdVector";

// Utilities
import { fetchGeminiResponse } from "~/utils/openRouterApi";
import { usePaginatedQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";
import { fetchOpenAIResponse } from "~/utils/OpenaiApi";

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

const FlashListEmptyState = () => (
  <View style={{ transform: [{ scaleY: -1 }, { scaleX: -1 }] }}>
    <EmptyState />
  </View>
);

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

  // Add state for layout measurement
  const [containerHeight, setContainerHeight] = React.useState(0);
  
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

  // Message Handling
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !chatId || !currentUser) return;

    try {
      // Send user message
      await handleMessageSubmit({
        content,
        chatId: chatId as Id<"chats">,
        senderId: currentUser._id,
        isAi: false,
        type: "text",
      });

      // Format messages for OpenAI
      const formattedMessages = queryMsgs.map(msg => ({
        isAi: msg.isAi,
        content: msg.content
      }));
      formattedMessages.push({ isAi: false, content });

      // Get AI response
      const response = await fetchOpenAIResponse(formattedMessages);
      
      if (response.success && response.data) {
        await handleMessageSubmit({
          content: response.data,
          chatId: chatId as Id<"chats">,
          senderId: AI_USER_ID,
          isAi: true,
          type: "text",
        });
      } else {
        console.error("AI response error:", response.error);
        Alert.alert("Error", "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error in message handling:", error);
      Alert.alert("Error", "Failed to process message");
    }
  };

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

        await handleSendMessage(content || "Media shared");
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

  // Add layout handler
  const handleLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  }, []);

  return (
    <View
      style={[
        defaultStyles.pageContainer,
        { backgroundColor: "rgba(0, 0, 0, 0.2)" },
      ]}
    >
      {/* <Stack.Screen
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
      /> */}

      <View
        style={[
          styles.gradient,
          { flex: 1, backgroundColor: "rgba(0,0,0,0.95)" },
        ]}
        onLayout={handleLayout}
      >
        {containerHeight > 0 && (
          <View style={[styles.listContainer, { height: containerHeight }]}>
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
              removeClippedSubviews={Platform.OS !== 'web'}
              drawDistance={500}
              inverted={true}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<FlashListEmptyState />}
              onEndReached={() => loadMore(50)}
              onEndReachedThreshold={0.5}
            />
          </View>
        )}

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
        {!queryMsgs?.length && <MessageIdeas onSelectCard={handleSendMessage} />}
        {loading && (
          <ActivityIndicator
            size="small"
            color={Colors.white}
            style={styles.loadingIndicator}
          />
        )}
        <MessageInput onShouldSend={handleSendMessage} />
      </KeyboardAvoidingView>
    </View>
  );
};

const EmptyState = () => {
  // const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  // const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // React.useEffect(() => {
  //   Animated.parallel([
  //     Animated.spring(scaleAnim, {
  //       toValue: 1,
  //       useNativeDriver: true,
  //       tension: 10,
  //       friction: 2
  //     }),
  //     Animated.timing(opacityAnim, {
  //       toValue: 1,
  //       duration: 800,
  //       useNativeDriver: true
  //     })
  //   ]).start();
  // }, []);

  return (
    <View style={styles.emptyContainer}>
      {/* <Animated.View style={[
        styles.birdContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}>
        <BirdVector width={100} height={100} />
      </Animated.View>
      <Animated.Text style={[styles.emptyText, { opacity: opacityAnim }]}>
        Start a new conversation
      </Animated.Text> */}
      <Image source={require("~/assets/images/icon.png")} style={styles.emptyImage} />
      <Text style={styles.emptyText}>Start a new conversation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    position: 'relative',
    width: '100%',
  },
  listContainer: {
    width: '100%',
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
    marginBottom: "70%",
  },
  birdContainer: {
    marginBottom: 20,
  },
  emptyText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    opacity: 0.8,
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
