import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { Icon } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IconCircle from "./IconCircle";

interface AnimHeaderProps {
  title: string;
  buttons: string[];
  onButtonSelect?: (button: string) => void;
  children: React.ReactNode;
  rightIcons?: { icon: string; onPress: () => void }[]; // NEW
}

const HEADER_EXPANDED_HEIGHT = 100;
const HEADER_COLLAPSED_HEIGHT = 80;
const BUTTON_ROW_HEIGHT = 0;

const AnimHeader = ({
  title,
  buttons,
  onButtonSelect,
  children,
  rightIcons = [], // default: empty array
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

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, 100],
      [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 100], [30, 25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  }));

  const buttonRowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        ),
      },
    ],
  }));

  const handleSelect = (label: string) => {
    setSelectedButton(label);
    onButtonSelect?.(label);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,1)" }}>
      <StatusBar backgroundColor="rgba(0,0,0,1)" />
      <Animated.View style={[styles1.header, headerStyle]}>
        <Animated.Text style={[styles1.title, titleStyle]}>
          {title}
        </Animated.Text>

        <View style={styles1.rightIcons}>
          {rightIcons.map((item: any, index: any) => (
            <Pressable
              key={index}
              onPress={item.onPress}
              android_ripple={{ 
                color: 'rgba(255,255,255,0.1)', 
                borderless: true,
                radius: 20,
                foreground: true
              }}
              style={({ pressed }) => ({
                marginLeft: 10,
                opacity: pressed ? 0.6 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: 1,
                borderColor: pressed ? '#00BFFF' : 'transparent',
                borderRadius: 20,
              })}
              hitSlop={10}
              onPressIn={() => {
                // Handle press start (for more complex animations)
              }}
              onPressOut={() => {
                // Handle press release
              }}
            >
              <IconCircle 
                name={item.icon} 
                size={20}
                iconColor={'#00BFFF'}
              />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* <Animated.View style={[styles1.buttonRowContainer, buttonRowStyle]}>
        <View style={styles1.buttonRow}>
          {buttons.map((label: any) => (
            <TouchableOpacity
              key={label}
              style={[
                styles1.button,
                selectedButton === label && styles1.selectedButton,
              ]}
              onPress={() => handleSelect(label)}
            >
              <Text style={styles1.buttonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View> */}

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED_HEIGHT + BUTTON_ROW_HEIGHT + 10,
          paddingHorizontal: 16,
          paddingBottom: 50,
        }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
};

const styles1 = StyleSheet.create({
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
    fontSize: 20,
    color: "#fff",
    flex: 1,
  },
  rightIcons: {
    flexDirection: "row",
    gap: 15,
    padding:15,
  },
  buttonRowContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingLeft: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderBottomWidth: 1,
    borderColor: "#333",
    gap: 15,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#0086b3",
    borderRadius: 25,
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 15,
  },
  selectedButton: {
    backgroundColor: "#00BFFF80",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 25,
  },
});

export default AnimHeader;