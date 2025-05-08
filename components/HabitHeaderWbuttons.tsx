import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Animated, Text } from "react-native";
import IconCircle from "./IconCircle";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import { SliderSelector } from "./SliderSelector";
import { interpolate } from "react-native-reanimated";
import { useAnimatedStyle } from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import { useAnimatedScrollHandler } from "react-native-reanimated";
import { Habit } from "~/utils/Interfaces";

const HEADER_EXPANDED_HEIGHT = 150;
const HEADER_COLLAPSED_HEIGHT = 100;
const BUTTON_ROW_HEIGHT = 90;

interface HeaderProps {
  habits: Habit[];
  showCreatePage: boolean;
  setShowCreatePage: React.Dispatch<React.SetStateAction<boolean>>;
  selectedView: "Daily" | "Weekly" | "Overall";
  setSelectedView: React.Dispatch<
    React.SetStateAction<"Daily" | "Weekly" | "Overall">
  >;
  setSelectedHabit: React.Dispatch<React.SetStateAction<Habit | null>>;
  isLoadingView: "Daily" | "Weekly" | "Overall" | null;
  setIsLoadingView: React.Dispatch<
    React.SetStateAction<"Daily" | "Weekly" | "Overall" | null>
  >;
}

const HeaderWithButtons = ({
  habits,
  showCreatePage,
  setShowCreatePage,
  selectedView,
  setSelectedView,
  setSelectedHabit,
  isLoadingView,
  setIsLoadingView,
}: HeaderProps) => {
  const [selectedButton, setSelectedButton] = useState<string>("Daily");
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
    useNativeDriver: true,
  }));

  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 100], [0, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fontSize = interpolate(scrollY.value, [0, 100], [30, 25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return {
      useNativeDriver: true,
      transform: [{ translateY }],
      fontSize,
    };
  });

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
    useNativeDriver: true,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,1)" }}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <Animated.View style={[styles1.header, headerStyle]}>
        <Animated.Text style={[styles1.title, titleStyle]}>
          Habits
        </Animated.Text>
        <View style={styles1.rightIcons}>
          <TouchableOpacity
            style={{ elevation: 1 }}
            onPress={() => setShowCreatePage(true)}
          >
            <IconCircle name="add" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 10, elevation: 1 }}>
            <IconCircle name="settings" size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* SliderSelector with proper spacing */}
      <View style={{ marginTop: HEADER_EXPANDED_HEIGHT }}>
        <SliderSelector
          buttons={[
            {
              icon: (props) => (
                <MaterialCommunityIcons
                  name="calendar-today"
                  size={props.size}
                  color={props.color}
                />
              ),
              color: Colors.white,
              label: "Daily",
            },
            {
              icon: (props) => (
                <MaterialCommunityIcons
                  name="calendar-week"
                  size={props.size}
                  color={props.color}
                />
              ),
              color: Colors.white,
              label: "Weekly",
            },
            {
              icon: (props) => (
                <MaterialCommunityIcons
                  name="chart-arc"
                  size={props.size}
                  color={props.color}
                />
              ),
              color: Colors.white,
              label: "Overall",
            },
          ]}
          selectedIndex={["Daily", "Weekly", "Overall"].indexOf(selectedButton)}
          onSelect={(index) => {
            const views = ["Daily", "Weekly", "Overall"] as const;
            const selectedView = views[index] as "Daily" | "Weekly" | "Overall";
            setSelectedButton(selectedView);
            setIsLoadingView(selectedView);
            setTimeout(() => {
              setSelectedView(selectedView);
              setIsLoadingView(null);
            }, 1000);
          }}
        />
      </View>
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
    borderBottomWidth: 0.4,
    borderColor: "#333",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#0086b380",
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
    borderWidth: 0,
  },
});

export default HeaderWithButtons;
