import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator,
  DrawerToggleButton,
} from "@react-navigation/drawer";
import { Link, useNavigation, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  Button,
  ImageBackground,
} from "react-native";
import Colors from "~/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { DrawerActions, NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Chat } from "~/utils/Interfaces";
import * as ContextMenu from "zeego/context-menu";
import { Keyboard } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useChat } from "~/utils/ChatContext";
import { useAuth, useUser } from "@clerk/clerk-expo";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import ChatPage from "~/components/ChatPage";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { BlurView } from "expo-blur";
import { User } from "~/utils/Interfaces";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import SvgOne from "~/components/BirdVector";
import BirdVector from "~/components/BirdVector";

// Add type for navigation prop
type NavigationProp = DrawerNavigationProp<Record<string, object>>;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedHeader = () => {
  const progress = useSharedValue(0);
  const pathLength = 2730; // Roughly calculated from the path coordinates
  const fullWidth = 200; // Matches SVG width for the underline

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.ease,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: pathLength * (1 - progress.value),
    };
  });

  const underlineStyle = useAnimatedStyle(() => ({
    width: fullWidth * progress.value,
  }));

  // <ImageBackground
  //     source={require("~/assets/images/blakk.jpg")}
  //     style={{ paddingTop: 30 }}
  //     resizeMode="stretch"
  //   ></ImageBackground>

  return (
    <SafeAreaView style={{ backgroundColor: "rgb(0, 0, 0)" }}>
      <StatusBar backgroundColor="rgb(0, 0, 0)" style="dark" />
      <View
        style={[
          styles3.headerContainer,
          { backgroundColor: "rgb(0, 0, 0)" },
        ]}
      >
        <DrawerToggleButton tintColor={Colors.primary} />
        <View style={styles3.container}>
          <BirdVector width={100} height={35} />
        </View>
      </View>
    </SafeAreaView>
  );
};



const styles3 = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical:10,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 90,
    paddingBottom:5
  }
});

// ------------------------------------------

export const CustomDrawerContent = ({
  chatId,
  ...props
}: { chatId?: string | null } & any) => {
  const { signOut } = useAuth();
  const { bottom, top } = useSafeAreaInsets();
  // const db = useSQLiteContext();
  const isDrawerOpen = useDrawerStatus() === "open";
  const [history, setHistory] = useState<Chat[]>([]);
  const [Message, setMessage] = useState("");
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const getChats = useQuery(api.chats.getChats);
  // const createChat = useMutation(api.chats.getOrCreateChat);

  // GET ALL PRIVATE CHATS AND MAP TO HISTORY
  const loadChats = async () => {
    try {
      if (!currentUser) return;

      // Create or get the AI chat, only 1 AI chat per user
      // const chatId = await createChat({
      //   senderId: currentUser.userId!,
      //   participantIds: [],
      //   isAi: true,
      //   type: "group",
      // });

      // setchatId(chatId);
      // Fetch all chats
      const allChats = await getChats;

      if (!allChats) {
        return;
      }

      // Update history with all chats
      setHistory(
        allChats.map((chat: any) => ({
          id: chat._id,
          title: chat.isAi ? "AI" : "Private",
          type: chat.type,
        }))
      );
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  useEffect(() => {
    loadChats();
  }, [getChats]); // Runs on mount

  // Add useEffect to load chats when drawer opens
  // useEffect(() => {
  //   if (isDrawerOpen) {
  //     loadChats();
  //     Keyboard.dismiss();
  //   }
  // }, [isDrawerOpen]);

  const handleChatPress = (chat: Chat) => {
    if (!chat.id) {
      console.error("Chat ID is not defined");
      return;
    }

    if (chat.type == "group") {
      console.log("LISTING THE CHATS ARRAY");
      console.log(chat);
      console.log("LISTING THE CHATS ARRAY");
      console.log(`/(auth)/(drawer)/(ai-chat)/${encodeURIComponent(chat.id)}`);

      router.push(`/(auth)/(drawer)/(ai-chat)/${encodeURIComponent(chat.id)}`);
    } else {
      router.push(
        `/(auth)/(drawer)/(private-chat)/${encodeURIComponent(chat.id)}`
      );
    }
  };

  // ... existing code ...

  const onDeleteChat = (chatId: string) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          // Delete the chat
          // await db.runAsync('DELETE FROM chats WHERE id = ?', chatId);
          loadChats();
        },
      },
    ]);
  };

  const onRenameChat = (chatId: string) => {
    Alert.prompt(
      "Rename Chat",
      "Enter a new name for the chat",
      async (newName) => {
        if (newName) {
          // Rename the chat
          // await renameChat(db, chatId, newName);
          loadChats();
        }
      }
    );
  };

  return (
    <View style={{ flex: 1, marginTop: top }}>
      <View style={{ backgroundColor: "#fff", paddingBottom: 10 }}>
        <View style={styles.searchSection}>
          <Ionicons
            style={styles.searchIcon}
            name="search"
            size={20}
            color={Colors.greyLight}
          />
          <TextInput
            style={styles.input}
            placeholder="Search"
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      <Button
        title="Sign Out"
        onPress={() => signOut()}
        color={Colors.greyLight}
      />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "#fff", paddingTop: 0 }}
      >
        <DrawerItemList {...props} />
        {history.map((chat) => {
          const chatType = chat.type === "group" ? "ai-chat" : "private-chat";
          return (
            <ContextMenu.Root key={chat.id}>
              <ContextMenu.Trigger>
                <DrawerItem
                  label={chat.title || "untitled chat"}
                  onPress={() => handleChatPress(chat)}
                  inactiveTintColor="#000"
                />
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Preview>
                  {() => (
                    <View
                      style={{
                        padding: 16,
                        height: 200,
                        backgroundColor: "#fff",
                      }}
                    >
                      <Text>{chat.title || "Untitled Chat"}</Text>
                    </View>
                  )}
                </ContextMenu.Preview>

                <ContextMenu.Item
                  key={"rename"}
                  onSelect={() => onRenameChat(chat.id)}
                >
                  <ContextMenu.ItemTitle>Rename</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: "pencil",
                      pointSize: 18,
                    }}
                  />
                </ContextMenu.Item>
                <ContextMenu.Item
                  key={"delete"}
                  onSelect={() => onDeleteChat(chat.id)}
                  destructive
                >
                  <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: "trash",
                      pointSize: 18,
                    }}
                  />
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
          );
        })}
      </DrawerContentScrollView>

      <View
        style={{
          padding: 16,
          paddingBottom: 10 + bottom,
          backgroundColor: Colors.light,
        }}
      >
        <Link href="/(auth)/(modal)/settings" asChild>
          <TouchableOpacity style={styles.footer}>
            <Image
              source={require("~/assets/images/sample.png")}
              style={styles.avatar}
            />
            <Text style={styles.userName}>sample user</Text>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={Colors.greyLight}
            />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const Layout = () => {
  const currentUser = useQuery(api.users.getCurrentUser) as User | undefined;
  // Initialize with current user's chat ID if available
  const [chatId, setChatId] = useState<string | null>(
    currentUser?.defaultChatId ?? null
  );
  const dimensions = useWindowDimensions();
  const router = useRouter();
  const Drawer = createDrawerNavigator();
  const INitAiChat = useMutation(api.chats.initAiChat);
  const updateuserchatid = useMutation(api.users.updateChatID);
  const isInitializing = useRef(false);
  // const [userId, setUserId] = useState<string | null>(null);
  // const userIdInitialized = useRef(false);
  // const { user } = useUser();

  // useEffect(() => {
  //   if (user?.id && !userIdInitialized.current) {
  //     setUserId(user.id);
  //     userIdInitialized.current = true;
  //   }
  // }, [user]);

  useEffect(() => {
    const initializeChat = async () => {
      if (currentUser === undefined) return; // Still loading
      if (isInitializing.current) return;

      // Immediate update if we have a valid chat ID
      if (currentUser?.defaultChatId && currentUser.defaultChatId !== chatId) {
        setChatId(currentUser.defaultChatId);
        return;
      }

      // Only proceed if we truly need to create a new chat
      if (!currentUser?.defaultChatId) {
        isInitializing.current = true;
        try {
          const id = await INitAiChat();
          if (id) {
            await updateuserchatid({ defaultChatId: id });
            setChatId(id); // Ensure state is updated before navigation
            router.replace(`/(auth)/(drawer)/(ai-chat)/${id}`);
          }
        } catch (error) {
          console.error("Chat initialization failed:", error);
        } finally {
          isInitializing.current = false;
        }
      }
    };

    initializeChat();
  }, [currentUser]);

  if (currentUser === undefined || chatId === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  console.log("this is CHATID global from DRAWER LAYOUT-->>>>");
  console.log(chatId);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} chatId={chatId} />
      )}
      screenOptions={{
        headerLeft: () => <DrawerToggleButton />,
        headerStyle: {
          backgroundColor: "#f2f2f2",
        },
        headerShadowVisible: false,
        drawerActiveBackgroundColor: Colors.selected,
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#fff",
        overlayColor: "rgba(0, 0, 0,0.8)",
        drawerItemStyle: { borderRadius: 12 },
        drawerLabelStyle: { marginLeft: -20 },
        drawerStyle: { width: dimensions.width * 0.86 },
      }}
    >
      <Drawer.Screen
        name="(ai-chat)/[id]"
        initialParams={{ id: chatId }}
        options={{
          header: () => <AnimatedHeader />,
        }}
        component={ChatPage}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    marginHorizontal: 16,
    borderRadius: 10,
    height: 34,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.input,
  },
  searchIcon: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 0,
    alignItems: "center",
    color: "#424242",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roundImage: {
    width: 30,
    height: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  item: {
    borderRadius: 15,
    overflow: "hidden",
  },
  btnImage: {
    margin: 6,
    width: 16,
    height: 16,
  },
  dallEImage: {
    width: 28,
    height: 28,
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Layout;
