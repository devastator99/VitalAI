import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import IconCircle from "./IconCircle";

interface AnimHeaderProps {
  title: string;
  buttons?: string[];
  onButtonSelect?: (button: string) => void;
  children: React.ReactNode;
  rightIcons?: { icon: string; onPress: () => void }[];
  headerContent?: React.ReactNode;
}

const HEADER_EXPANDED_HEIGHT = 100;
const HEADER_COLLAPSED_HEIGHT = 80;

const AnimHeader = React.memo(({
  title,
  buttons = [],
  onButtonSelect,
  children,
  rightIcons = [],
  headerContent,
}: AnimHeaderProps) => {
  const [selectedButton, setSelectedButton] = useState<string>(
    buttons[0] || ""
  );
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Direct interpolation without extra withSpring/withTiming smoothing.
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 50],
      [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return { height };
  });

  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, 50],
      [30, 25],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return { fontSize };
  });

  const titleTransformStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(
      scrollY.value,
      [0, 50],
      [1, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return {
      transform: [{ scaleY }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,1)" }}>
      <StatusBar backgroundColor="rgba(0,0,0,1)" />
      <Animated.View style={[styles.header, headerStyle]}>
        {headerContent}
        <Animated.Text style={[styles.title, titleStyle, titleTransformStyle]}>
          {title}
        </Animated.Text>

        <View style={styles.rightIcons}>
          {rightIcons.map((item: any, index: any) => (
            <Pressable
              key={index}
              onPress={item.onPress}
              android_ripple={{
                color: "rgba(255,255,255,0.1)",
                borderless: true,
                radius: 20,
                foreground: true,
              }}
              style={({ pressed }) => ({
                marginLeft: 10,
                opacity: pressed ? 0.2 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                backgroundColor: pressed
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
                borderWidth: 1,
                borderColor: pressed ? "#00BFFF" : "transparent",
                borderRadius: 20,
                elevation: 1,
              })}
              hitSlop={10}
            >
              <IconCircle 
                name={item.icon} 
                size={20}
                iconColor={"#00BFFF"}
              />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED_HEIGHT + 10,
          paddingHorizontal: 16,
          paddingBottom: 50,
        }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    flex: 1,
  },
  rightIcons: {
    flexDirection: "row",
    gap: 15,
    padding: 15,
  },
});

export default AnimHeader;
