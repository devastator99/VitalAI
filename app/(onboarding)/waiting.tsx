import { View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import Animated, { FadeIn, FadeOut, useSharedValue, withDelay, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function WaitingScreen() {
  const { user } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && !userId) {
      setUserId(user.id);
    }
  }, [user]);

  const userStatusResult = useQuery(
    api.users.getStatus,
    userId ? { userId } : "skip"
  );

  const router = useRouter();

  useEffect(() => {
    const isApproved = userStatusResult ?? false;
    if (isApproved) {
      router.replace("/(auth)/(drawer)/(ai-chat)/new");
    }
  }, [userStatusResult]);

  // Animation for text
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 1000 }));
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * 10 }],
  }));

  return (
    <LinearGradient
      colors={["#3b82f6", "#60a5fa"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ActivityIndicator size="large" color="white" />

      <Animated.View
        style={[textAnimatedStyle, { marginTop: 40, alignItems: "center" }]}
        entering={FadeIn.delay(500)}
        exiting={FadeOut}
      >
        <Text
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "900",
            textAlign: "center",
            letterSpacing: 1,
            lineHeight: 40,
            textShadowColor: "rgba(0, 0, 0, 0.2)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
          }}
        >
          Waiting for administrator approval...
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 18,
            fontWeight: "600",
            textAlign: "center",
            letterSpacing: 0.5,
            lineHeight: 24,
            textShadowColor: "rgba(0, 0, 0, 0.2)",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
        >
          This might take some time...
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}