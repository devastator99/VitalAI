import { Modal } from "react-native";
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

import { useEffect, useRef, useState } from "react";

import { Chat } from "~/utils/Interfaces";
import * as ContextMenu from "zeego/context-menu";
import { Keyboard } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useChat } from "~/utils/ChatContext";
import { useAuth, useUser } from "@clerk/clerk-expo";

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
import { Id } from "~/convex/_generated/dataModel";

import WaterGlass from "~/components/WaterGlass";
import NextMealPage from "../../../components/nextmealpage";
import ChatDetailsModal from "~/components/ChatDetailsModal";
import HomeDashboard from "~/components/HomeDashboard";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedHeaderProps {
  chatId: string;
  onMenuPress: () => void;
}

const AnimatedHeader = ({ chatId, onMenuPress }: AnimatedHeaderProps) => {
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
      <StatusBar style="light" />
      <View
        style={[styles3.headerContainer, { backgroundColor: "rgb(0, 0, 0)" }]}
      >
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="grid-outline" size={20} color={"rgb(71, 123, 211)"} />
        </TouchableOpacity>
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
    paddingTop:10
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

const Layout = () => {
  const router = useRouter();
  const { chatId, setChatId, showDashboard, setShowDashboard } = useAppStore((state) => ({
    chatId: state.chatId,
    setChatId: state.setChatId,
    showDashboard: state.showDashboard,
    setShowDashboard: state.setShowDashboard,
  }));
  const currentUser = useQuery(api.users.getCurrentUser) as User | undefined;
  const dimensions = useWindowDimensions();
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

  return (
    <View style={{ flex: 1 }}>
      <AnimatedHeader 
        chatId={chatId} 
        onMenuPress={() => {
          console.log("Menu icon pressed, toggling NextMealPage visibility");
          setShowDashboard(!showDashboard);
        }} 
      />
      <ChatPage chatId={chatId} />
      {showDashboard && (
        <View style={StyleSheet.absoluteFillObject}>
          <HomeDashboard />
        </View>
      )}
    </View>
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
