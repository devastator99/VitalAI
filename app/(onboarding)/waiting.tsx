import { View, Text, ActivityIndicator, Dimensions } from "react-native";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MESSAGES = [
  "Reviewing your profile...",
  "Checking your preferences...",
  "Setting up your personalized experience...",
  "Almost there...",
];

export default function WaitingScreen() {
  const { user } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

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

  // Animations
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    // Circular progress animation
    progress.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );

    // Pulse animation for the icon
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );

    // Dots animation
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    // Message rotation
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 60}%`,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <LinearGradient
      colors={["#1a1a1a", "#000000"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Animated.View
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 3,
            borderColor: "#3b82f6",
            marginBottom: 40,
          },
          circleStyle,
        ]}
      >
        <Ionicons name="shield-checkmark" size={60} color="#3b82f6" />
      </Animated.View>

      <View style={{ alignItems: "center", width: SCREEN_WIDTH * 0.8 }}>
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Verification in Progress
        </Text>

        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          key={messageIndex}
          style={{ marginBottom: 30, flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={{
              color: "#3b82f6",
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {MESSAGES[messageIndex]}
          </Text>
          <Animated.Text
            style={[
              {
                color: "#3b82f6",
                fontSize: 18,
                marginLeft: 3,
              },
              dotStyle,
            ]}
          >
            ...
          </Animated.Text>
        </Animated.View>

        <View
          style={{
            width: "100%",
            height: 6,
            backgroundColor: "#ffffff15",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              {
                height: "100%",
                backgroundColor: "#3b82f6",
                borderRadius: 3,
              },
              progressStyle,
            ]}
          />
        </View>

        <Text
          style={{
            color: "#ffffff80",
            fontSize: 14,
            textAlign: "center",
            marginTop: 30,
            lineHeight: 20,
          }}
        >
          Your account is being reviewed by our team.{"\n"}
          We'll notify you once the verification is complete.
        </Text>
      </View>
    </LinearGradient>
  );
}