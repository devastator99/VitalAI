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
import Image from "@d11/react-native-fast-image";
import Colors from "~/utils/Colors";
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
import { useAppStore } from "~/store";
import AnimatedButton from "~/components/AnimatedButton";
import MagButton from "~/components/MagButton";
import ChatDetailsModal from "~/components/ChatDetailsModal";
import { Id } from "~/convex/_generated/dataModel";
import { Drawer } from "expo-router/drawer";
import WaterGlass from "~/components/WaterGlass";

// Add type for navigation prop
type NavigationProp = DrawerNavigationProp<Record<string, object>>;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedHeader = ({ chatId }: { chatId: string }) => {
  const progress = useSharedValue(0);
  const pathLength = 2730; // Roughly calculated from the path coordinates
  const fullWidth = 200; // Matches SVG width for the underline
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

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

  return (
    <SafeAreaView style={{ backgroundColor: "rgb(0, 0, 0)" }}>
      <StatusBar backgroundColor="rgb(0, 0, 0)" style="dark" />
      <View
        style={[styles3.headerContainer, { backgroundColor: "rgb(0, 0, 0)" }]}
      >
        <DrawerToggleButton tintColor={"rgb(71, 123, 211)"} />
        <View style={styles3.container}>
          <BirdVector width={100} height={35} />
        </View>
        <TouchableOpacity
          onPress={() => setIsDetailsModalVisible(true)}
          style={styles3.optionsButton}
        >
          <Ionicons
            name="ellipsis-horizontal-circle-sharp"
            size={28}
            color={"rgb(130, 164, 223)"}
          />
        </TouchableOpacity>
      </View>

      {isDetailsModalVisible && (
        <ChatDetailsModal
          isVisible={isDetailsModalVisible}
          onClose={() => setIsDetailsModalVisible(false)}
          chatId={chatId as Id<"chats">}
        />
      )}
    </SafeAreaView>
  );
};

const styles3 = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  optionsButton: {
    padding: 8,
    marginLeft: "auto",
  },
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
    <LinearGradient
      colors={[Colors.PitchBlack, "#001a33", Colors.PitchBlack]}
      style={{ flex: 1 }}
    >
      {/* Header Section */}
      <BlurView intensity={70} tint="dark" style={styles.header}>
        <View style={styles.searchSection}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.greyLight}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search chats"
            placeholderTextColor={Colors.greyLight + "aa"}
            style={styles.searchInput}
          />
        </View>
      </BlurView>

      {/* Chat List */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.listContent}
      >
        {/* {history.map((chat) => (
          <ContextMenu.Root key={chat.id}>
            <ContextMenu.Trigger>
              <LinearGradient
                colors={['#ffffff08', '#ffffff02']}
                style={styles.chatItem}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name={chat.type === 'group' ? 'people' : 'chatbubble'} 
                  size={18} 
                  color={Colors.greyLight} 
                />
                <Text style={styles.chatTitle}>
                  {chat.title || "Untitled Chat"}
                </Text>
              </LinearGradient>
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

          
        ))} */}

        <View style={styles.waterSection}>
          <Text style={styles.sectionTitle}>Hydration Tracker</Text>
          <WaterGlass />
          <Text style={styles.waterDescription}>
            Track your daily water intake
          </Text>
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <LinearGradient
        colors={[Colors.PitchBlack, Colors.PitchBlack]}
        style={styles.footer}
      >
        <MagButton
          onPress={() => signOut()}
          buttonColor={Colors.lightRed}
          buttonStyle={styles.signOutButton}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </MagButton>

        <Link href="/(auth)/(modal)/settings" asChild>
          <TouchableOpacity style={styles.profileButton}>
            {/* <Image
              source={require("~/assets/images/sample.png")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>Sample User</Text>
              <Text style={styles.userEmail}>user@example.com</Text>
            </View>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.greyLight}
            /> */}
          </TouchableOpacity>
        </Link>
      </LinearGradient>
    </LinearGradient>
  );
};

const Layout = () => {
  const { chatId, setChatId } = useAppStore();
  const currentUser = useQuery(api.users.getCurrentUser) as User | undefined;
  const dimensions = useWindowDimensions();
  const router = useRouter();
  const Drawer = createDrawerNavigator();
  const INitAiChat = useMutation(api.chats.initAiChat);
  const updateuserchatid = useMutation(api.users.updateChatID);
  const { isInitializing, setIsInitializing } = useAppStore((state) => ({
    isInitializing: state.isInitializing,
    setIsInitializing: state.setIsInitializing,
  }));

  useEffect(() => {
    if (currentUser) {
      setChatId(currentUser?.defaultChatId ?? null);
    }
  }, [currentUser, setChatId]);

  useEffect(() => {
    const initializeChat = async () => {
      if (currentUser === undefined) return; // Still loading
      if (isInitializing) return;

      // Immediate update if we have a valid chat ID
      if (currentUser?.defaultChatId && currentUser.defaultChatId !== chatId) {
        setChatId(currentUser.defaultChatId);
        return;
      }

      // Only proceed if we truly need to create a new chat
      if (!currentUser?.defaultChatId) {
        setIsInitializing(true);
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
          setIsInitializing(false);
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

  // console.log("this is CHATID global from DRAWER LAYOUT-->>>>");
  // console.log(chatId);

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
          header: () => <AnimatedHeader chatId={chatId} />,
        }}
        component={ChatPage}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ffffff33",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.mainBlue,
  },
  searchInput: {
    flex: 1,
    color: Colors.greyLight,
    paddingVertical: 10,
    fontSize: 15,
  },
  listContent: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  chatTitle: {
    color: Colors.greyLight,
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    padding: 12,
    gap: 16,
    height: 280,
    paddingBottom: 20,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ffffff15",
  },
  signOutButton: {
    borderWidth: 2,
    borderColor: Colors.lightRed,
    borderRadius: 25,
    flex: 0,
    alignItems: "center",
    gap: 0,
    padding: 5,
    backgroundColor: "rgba(128, 55, 55, 0.7)",
    width: 100,
    height: 60,
  },
  signOutText: {
    color: Colors.red,
    fontSize: 14,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    color: Colors.greyLight,
    fontWeight: "500",
  },
  userEmail: {
    color: Colors.greyLight + "aa",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  waterSection: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingVertical: 10,
    width: "100%",
    backgroundColor: "rgba(0, 30, 60, 0.3)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(71, 123, 211, 0.2)",
    padding: 15,
  },
  sectionTitle: {
    color: Colors.mainBlue,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  waterDescription: {
    color: Colors.greyLight + "99",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default Layout;
