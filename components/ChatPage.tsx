import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "convex/react";
import { useAppStore } from "~/store";
import { defaultStyles } from "~/constants/Styles";
import { Id } from "~/convex/_generated/dataModel";
import { Stack, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Role } from "~/utils/Interfaces";
import React from "react";

// Components
import HeaderDropDown from "~/components/HeaderDropDown";
import MessageInput from "~/components/MessageInput";
import MessageBubble from "~/components/MessageBubble";
import MessageIdeas from "~/components/MessageIdeas";
import ScrollToBottomButton from "./ScrollToBottomButton";
import FilePreview from '~/components/FilePreview';

// Utilities
import { fetchGeminiResponse } from "~/utils/openRouterApi";
import Colors from "~/constants/Colors";
import { usePaginatedQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

const AI_USER_ID = "j576bezhm29ycwx1bh4mf7db3s7bpy6q" as Id<"users">;

const RenderChatBubble = React.memo(({ item, currentUser }: { item: any, currentUser: any }) => {
  const isCurrentUser = item.senderId === currentUser?._id;
  const senderUser = useQuery(api.users.getUserById, { id: item.senderId });

  return (
    <MessageBubble
      content={item.content}
      role={item.isAi ? Role.Bot : Role.User}
      isCurrentUser={isCurrentUser}
      profileImage={senderUser?.profileDetails?.picture}
      type={item.type}
      attachId={item.attachId}
    />
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
  // const messagesData = useQuery(
  //   api.messages.getMessages,
  //   chatId ? { chatId } : "skip"
  // );

  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getMessages,
    chatId ? { chatId } : "skip",
    { initialNumItems: 100 }
  );

  // Media Handling
  const handleMessageSubmit = useMutation(api.messages.sendMessage);

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
          type: previewFile.type === 'document' ? 'file' : previewFile.type,
          attachId: attachId as Id<"_storage">,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to upload media");
      } finally {
        setLoading(false);
      }
    }, [chatId, currentUser, previewFile]);

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
    ({ item }: { item: any }) => <RenderChatBubble item={item} currentUser={currentUser} />,
    [currentUser]
  );

  return (
    <View style={[defaultStyles.pageContainer, { backgroundColor: "rgba(0, 0, 0, 0.2)" }]}>
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

      <LinearGradient
        colors={["rgba(0, 0, 0, 0.95)", "rgba(0, 0, 0, 0.95)"]}
        style={[styles.gradient, { flex: 1 }]}
      >
        <View style={{ flex: 1 }}>
          <FlashList
            ref={listRef}
            data={[...results]}
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
                offset: 0,  // Keep this as 0 since we're using inverted list
                animated: true 
              })
            }
          />
        )}
      </LinearGradient>

      {previewFile && (
          <FilePreview
            fileUri={previewFile.uri}
            fileType={previewFile.type}
            fileName={previewFile.name}
            attachId={previewFile.attachId || ""}
            onSend={(attachId) => {
              handleMedia(attachId, 'File shared');
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
        {!results?.length && <MessageIdeas onSelectCard={handleSend} />}
        
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
    flex: 1,
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
});

export default React.memo(ChatPage);
