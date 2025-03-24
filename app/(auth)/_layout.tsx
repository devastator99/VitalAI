import Colors from "~/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View ,Image} from "react-native";
import { Authenticated, useQuery } from "convex/react";
// import { useConvexUser } from "~/utils/UserContext";
import { Drawer } from "react-native-drawer-layout";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { useChat } from "~/utils/ChatContext";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClerk } from "@clerk/clerk-expo";
import { useSharedValue } from "react-native-reanimated";
import {
  useAnimatedProps,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";

const Layout = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  console.log("inside layoutv2");
  const staticBlurViewProps = {
    intensity: 40, // Set the desired static intensity
  };
  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

  const scrollY = useSharedValue(0);

  // const animatedProps = useAnimatedProps(() => {
  //   const intensity = interpolate(
  //     scrollY.value,
  //     [0, 150, 172],
  //     [0, 0, 50],
  //     Extrapolation.CLAMP
  //   );

  //   return {
  //     intensity,
  //   };
  // });
  // <AnimatedBlurView
  //             {...staticBlurViewProps}
  //             style={{ flex: 1 }}
  //           />

  return (
    <Authenticated>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.greyLight,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: "transparent",
          },
          tabBarBackground: () => (
            <BlurView
              intensity={70}
              tint="dark"
              experimentalBlurMethod={"dimezisBlurView"}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
            </BlurView>
          ),
        }}
      >
        {/* 🔹 AI Chat Tab */}
        <Tabs.Screen
          name="(drawer)"
          options={{
            title: "AI Chat",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />
        {/* 🔹 Contacts Tab */}
        <Tabs.Screen
          name="contacts"
          options={{
            title: "Contacts",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="aperture" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="HabitDashboard"
          options={{
            title: "Habits",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="aperture" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "settings",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </Authenticated>
  );
};

export default Layout;
