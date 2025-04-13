import React, { useEffect, useState, FC, useRef, useContext } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  Text,
  Dimensions,
  Keyboard,
  Platform,
  ActivityIndicator,
  Image,
  TextStyle,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  Alert,
} from "react-native";
import {scale, verticalScale, moderateScale} from "react-native-size-matters";
import dayjs from "dayjs";
import { Ionicons, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import MessageInput from "~/components/MessageInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendMessage } from "~/convex/messages";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Id } from "~/convex/_generated/dataModel";
// import { useConvexUser } from "~/utils/UserContext";
/**
 * ---------------------------------------------
 * Interfaces & Enums
 * ---------------------------------------------
 */
export enum Role {
  User = "User",
  Bot = "Bot",
}

export interface Message {
  id: string;
  content: string;
  isAi: boolean;
  senderId: string;
  createdAt: string;
  role: Role;
  imageUri?: string;
  isTyping? : boolean,        // Optional URL for image messages
  prompt?: string; 
  isMessageRead?: boolean,
}
/**
 * ---------------------------------------------
 * Colors (replace these with your own palette)
 * ---------------------------------------------
 */
const Colors = {
  primary: "#3498db",
  secondary: "#1abc9c",
  light: "#d3d3d3",
  text: "#FFFFFF",
};

/**
 * ---------------------------------------------
 * Dummy Data
 * ---------------------------------------------
 */
const dummyMessages: Message[] = [
  {
    id: "1",
    role: Role.Bot,
    isAi: true,
    content: "Hi there! How can I assist you today?",
    createdAt: dayjs().subtract(21, "minute").toISOString(),
    senderId: "bot_1",
    isMessageRead: true,
    imageUri: undefined,
    prompt: undefined
  },
  {
    id: "2",
    role: Role.User,
    content: "Can you show me the latest product updates?",
    isAi: false,
    createdAt: dayjs().subtract(20, "minute").toISOString(),
    senderId: "user_1",
    isMessageRead: true,
    imageUri: undefined,
    prompt: undefined
  },
  {
    id: "3",
    role: Role.Bot,
    isAi: true,
    content: "Sure! Here's an image of our new product lineup:",
    createdAt: dayjs().subtract(19, "minute").toISOString(),
    senderId: "bot_1",
    isMessageRead: true,
    imageUri: undefined,
    prompt: undefined
  }
];


/**
 * ---------------------------------------------
 * Reusable Hook: useKeyboardOffsetHeight
 *   - Tracks the keyboard height to offset UI
 * ---------------------------------------------
 */
const useKeyboardOffsetHeight = () => {
  const [keyboardOffsetHeight, setKeyboardOffsetHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardOffsetHeight(e.endCoordinates.height)
    );
    const hideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOffsetHeight(0)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardOffsetHeight;
};

/**
 * ---------------------------------------------
 * Typing Animation: LoadingDots
 *   - Displays an animated "..." to indicate
 *     that the bot is typing
 * ---------------------------------------------
 */
const LoadingDots: FC = () => {
  const [animatedValues] = useState([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]);

  useEffect(() => {
    const startAnimation = () => {
      // Animate three dots in a staggered sequence
      Animated.loop(
        Animated.stagger(
          100,
          animatedValues.map((val) =>
            Animated.sequence([
              Animated.timing(val, {
                toValue: 0.5,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.timing(val, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
            ])
          )
        )
      ).start();
    };

    startAnimation();

    // Cleanup: reset scale values to 1 if unmounted
    return () => {
      animatedValues.forEach((val) => val.setValue(1));
    };
  }, [animatedValues]);

  return (
    <View style={styles.loadingContainer}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{ scale: animatedValue }],
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * ---------------------------------------------
 * MessageBubble
 *   - Renders individual messages (text, images, or typing dots)
 * ---------------------------------------------
 */
interface MessageBubbleProps {
  message: Message;
}
const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  const user = useUser();
  const isMyMessage = message.senderId === user.user?.primaryEmailAddress?.emailAddress;
  const isMessageRead = message?.isMessageRead;

  return (
    <View
      style={[
        styles.messageContainer,
        {
          maxWidth: isMyMessage ? "80%" : "92%",
          alignSelf: isMyMessage ? "flex-end" : "flex-start",
          backgroundColor: isMyMessage ? "#683EF3" : "#232E3B",
          borderBottomRightRadius: isMyMessage ? 0 : 20,
          borderBottomLeftRadius: isMyMessage ? 20 : 0,
        },
      ]}
    >
      {/* Show different content depending on the message type */}
      {message.isTyping ? (
        <LoadingDots />
      ) : message.imageUri ? (
        <Image source={{ uri: message.imageUri }} style={styles.image} />
      ) : (
        <Text
          style={[
            styles.messageText,
            { textAlign: isMyMessage ? "right" : "left" },
          ]}
        >
          {message.content}
        </Text>
      )}

      {/* Time & Read Receipt */}
      <View style={styles.timeAndReadContainer}>
        <Text style={styles.timeText}>
          {message.createdAt
            ? dayjs(message.createdAt).format("HH:mm A")
            : dayjs().format("HH:mm A")}
        </Text>

        {isMyMessage && (
          <Image
            source={require("~/assets/images/asuka-2239.gif")} // or your read-receipt icon
            style={[
              styles.readIndicator,
              { tintColor: isMessageRead ? "#53a6fd" : "#8aa69b" },
            ]}
          />
        )}
      </View>
    </View>
  );
};

/**
 * ---------------------------------------------
 * SendButton (Message Input + Send Icon)
 *   - Provides an input field and handles message sending
 * ---------------------------------------------
 */
interface SendButtonProps {
  item: { conversation_id: string }; // could be your conversation object
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  setHeightOfMessageBox: (height: number) => void;
  onSendMessage: (message: string) => void; // callback to actually send
}
const SendButton: FC<SendButtonProps> = ({
  item,
  isTyping,
  setIsTyping,
  setHeightOfMessageBox,
  onSendMessage,
}) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState("");
  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  /**
   * Handle content size changes for dynamic text input height
   */
  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    setHeightOfMessageBox(event.nativeEvent.contentSize.height);
  };

  /**
   * Animate the send button in/out based on `isTyping`
   */
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isTyping ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isTyping]);

  /**
   * Interpolated animation style for the send button
   */
  const sendButtonStyle = {
    opacity: animationValue,
    transform: [
      {
        scale: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  };

  /**
   * Called on text change
   */
  const handleTextChange = (text: string) => {
    setIsTyping(!!text); // isTyping is true if there's text
    setMessage(text);
  };

  /**
   * Called when pressing "Send"
   */
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      // Optional: Make an API call
      // For demonstration, we'll just call the passed callback
      onSendMessage(message.trim());

      // Clear local states
      setMessage("");
      setIsTyping(false);

      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View
      style={[
        sendButtonStyles.container,
        {
          bottom:
            Platform.OS === "android" ? 0 : Math.max(keyboardOffsetHeight, 0),
        },
      ]}
    >
      <View style={sendButtonStyles.subContainer}>
        {/* Emoji Icon (or any other icon you like) */}
        <View style={sendButtonStyles.emojiButton}>
          <FontAwesome6 name="smile" size={scale(20)} color={Colors.light} />
        </View>

        {/* The actual TextInput */}
        <View
          style={[
            sendButtonStyles.inputContainer,
            { width: isTyping ? "80%" : "72%" },
          ]}
        >
          <TextInput
            editable
            multiline
            value={message}
            placeholderTextColor="#eee"
            style={sendButtonStyles.textInput}
            placeholder="Type your message..."
            onChangeText={handleTextChange}
            onFocus={() => {
              console.log(
                `Typing started for conversation ${item.conversation_id}`
              );
            }}
            onBlur={() => {
              console.log(
                `Typing stopped for conversation ${item.conversation_id}`
              );
            }}
            onContentSizeChange={handleContentSizeChange}
          />
        </View>

        {/* Conditional: Show send icon if typing, otherwise show attachments/mic */}
        {isTyping ? (
          <Animated.View
            style={[sendButtonStyles.sendButtonWrapper, sendButtonStyle]}
          >
            <TouchableOpacity
              onPress={handleSend}
              style={sendButtonStyles.sendButton}
            >
              <Ionicons name="send" size={scale(20)} color={Colors.text} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={sendButtonStyles.flexRowGap}>
            <Entypo name="attachment" size={scale(20)} color={Colors.light} />
            <Ionicons
              name="mic-outline"
              size={scale(24)}
              color={Colors.light}
            />
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Styles for the SendButton
 */
const sendButtonStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0, // Sticks to the bottom
    left: 0,
    width: "100%",
    backgroundColor: "#000",
    padding: 10,
  },
  subContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emojiButton: {
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#000",
  },
  textInput: {
    color: Colors.light,
    fontSize: scale(14),
    height: 50,
  },
  sendButtonWrapper: {
    marginLeft: 10,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 50,
  },
  flexRowGap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
});

/**
 * ---------------------------------------------
 * Chat Component
 *   - Renders the list of messages + input area
 * ---------------------------------------------
 */
interface ChatProps {
  messages: Message[];
  loading: boolean;
  onLoadMore: () => void;
}

const Chat: FC<ChatProps> = ({ messages, loading, onLoadMore }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [heightOfMessageBox, setHeightOfMessageBox] = useState(50);
  const keyboardOffsetHeight = useKeyboardOffsetHeight();
  const [chatMessages, setMessages] = useState<
    {
      id: string;
      content: string;
      senderId: string;
      isAi: boolean;
      createdAt: string;
      role: Role;
      isMessageRead: boolean;
      imageUri?: string;
      prompt?: string;
    }[]
  >([]);
  const sendMessages = useMutation(api.messages.sendMessage);
  const getorcreateChat = useMutation(api.chats.getOrCreateChat);
  // const [currentUser , setCurrentUser] = useConvexUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  console.log("CURRENT USER FROM PRIVATE CHATS %$^ : ",currentUser);

  const { id } = useLocalSearchParams<{ id: string }>();

  // const [recipientId, setrecipientId] = useState<string | null>(id || null);
  const [chatId, setchatId] = useState<string | null>(id || null);
  console.log("chattttt idddd");
  console.log(chatId);
  // const chatIdRef = useRef(id);

  // function setChatId(id: string) {
  //   chatIdRef.current = id;
  //   _setChatId(id);
  // }



  
  // useEffect(() => {
  //   const initializeChat = async () => {
  //     if (!chatId && currentUser?.userId && recipientId) {
  //       try {
  //         const newChatId = await getorcreateChat({
  //           isAi: false,
  //           type: "private",
  //           senderId: currentUser.userId,
  //           participantIds: [recipientId],
  //         });
          
  //         // Only update if component is still mounted
  //         if (!chatId) {
  //           setchatId(newChatId);
  //           router.replace(`/(auth)/(drawer)/(private-chat)/${newChatId}`);
  //         }
  //       } catch (error) {
  //         console.error("Failed to initialize chat:", error);
  //         Alert.alert("Error", "Could not create a new chat");
  //       }
  //     }
  //   };

  //   initializeChat();
  // // Remove chatId from dependencies to prevent loop
  // }, [currentUser?.userId]); // Only track these dependencies

  // const messagesData = useQuery(
  //   api.messages.getMessages,
  //   { chatId: id }
  // );

  // useEffect(() => {
  //   if (messagesData) {
  //     setMessages(
  //       messagesData.map((msg: any) => ({
  //         id: msg._id,
  //         content: msg.content,
  //         senderId: msg.senderId,
  //         isAi: Boolean(msg.isAi),
  //         createdAt: msg._creationTime.toString(),
  //         role: msg.isAi ? Role.Bot : Role.User,
  //         isMessageRead: true,
  //         imageUri: undefined,
  //         prompt: undefined
  //       }))
  //     );
  //   }
  // }, [messagesData]); 
  

  const handleSendMessage = async (message: string) => {
    if (message.trim() === "" || !chatId || !currentUser) return;

    try {
      await sendMessages({
        chatId: chatId as Id<"chats">,
        senderId: currentUser!.userId! as Id<"users">,
        content: message,
        isAi: false,
        type: "text",
      });
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessageBubble = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <View
      style={[
        styles.chatContainer,
        {
          height: Dimensions.get("window").height * 0.9 - keyboardOffsetHeight,
        },
      ]}
    >
      {loading && (
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Let's start the legendary conversation!
          </Text>
          {/**
           * If no messages yet, you can still show an input (SendButton).
           * Provide any conversation data you have in `item`.
           */}
          {/* <SendButton
            item={{ conversation_id: "dummy_convo_id" }}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            setHeightOfMessageBox={setHeightOfMessageBox}
            onSendMessage={handleSendMessage}
          /> */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.select({ios: 120, android: 20})}
            style={styles.inputOverlay}
          >
            <MessageInput onShouldSend={handleSendMessage} />
          </KeyboardAvoidingView>
        </View>
      ) : (
        <>
          <FlatList
            data={chatMessages}
            inverted
            keyExtractor={(item) => item.createdAt}
            renderItem={renderMessageBubble}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingBottom: 80 }} // give space for input
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.select({ios: 115, android: 20})}
            style={styles.inputOverlay}
          >
            <MessageInput onShouldSend={handleSendMessage} />
          </KeyboardAvoidingView>
        </>
      )}
    </View>
  );
};
/**
 * ---------------------------------------------
 * Main App Component
 *   - Just returns the Chat with sample data
 * ---------------------------------------------
 */
export default function App() {
  const [messages, setMessages] = useState<Message[]>(dummyMessages);

  // For demonstration, do nothing when loading more
  const onLoadMore = () => {
    console.log("Load more messages here...");
  };

  return <Chat messages={messages} loading={false} onLoadMore={onLoadMore} />;
}

/**
 * ---------------------------------------------
 * Styles (Chat, Bubbles, etc.)
 * ---------------------------------------------
 */
const styles = StyleSheet.create({
  chatContainer: {
    width: "100%",
    // height: "100%",
  },
  loadingSpinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 999,
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: scale(18),
    color: "#AAA",
  },
  messageContainer: {
    margin: 8,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  messageText: {
    fontSize: scale(13),
    color: "#FFF",
  },
  image: {
    height: verticalScale(20),
    width: scale(35),
    borderRadius: 10,
    resizeMode: "cover",
  },
  timeAndReadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  timeText: {
    fontSize: scale(10),
    color: "#AAA",
  },
  readIndicator: {
    width: 15,
    height: 15,
    marginLeft: 5,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: scale(6),
    height: verticalScale(6),
    backgroundColor: "#FFF",
    borderRadius: 50,
    marginHorizontal: 2,
  },
  inputOverlay: {
    width: "100%",
    paddingBottom: 10,
  },
});
