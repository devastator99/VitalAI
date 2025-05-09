import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Button,
  TextInput,
  FlatList,
  ActivityIndicator,
  PanResponder,
  ListRenderItemInfo,
} from "react-native";
import {
  ProgressBar,
  Icon,
  Modal,
  Surface,
  Chip,
  Text,
  Card,
  RadioButton,
  Portal,
  Provider,
} from "react-native-paper";
// import { Card, Text, Input, RadioGroup, Button, XStack, Label} from 'react-native-reusables';
import { BlurView } from "expo-blur";
import {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { HabitCreationScreen } from "~/components/HabitCreationScreen";
import IconCircle from "~/components/IconCircle";
import HeaderWithButtons from "~/components/HabitHeaderWbuttons";
import { LinearGradient } from "expo-linear-gradient";
import ContributionGrid from "~/components/ContributionGrid";
import type { Habit } from "~/utils/Interfaces";
import type { Entry } from "~/utils/Interfaces";
import type { HabitType } from "~/utils/Interfaces";
import HabitDetail from "~/components/HabitDetail";
import { SliderSelector } from "../../components/SliderSelector";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SwipeListView } from "react-native-swipe-list-view";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DAYS, COLOR_PALETTE, ICONS } from "~/utils/habitData";
import { useQuery } from "convex/react";
import { getHabits } from "~/convex/habits";
import { Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import HabitCard from "../../components/HabitCard";
import { useMutation } from "convex/react";
import { EmptyHabitState } from "~/components/EmptyHabitState";
// TO ADD: // Precompute lightened colors in habit creation
//habit name and frequency in header in weekdays with right icons for edit delete and share
//display  total , score percent ,in a card
//display description in a card ,
//display linechart of progress  aand a notes section with add note button

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth;

const HabitDashboard = () => {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const habits = useQuery(
    api.habits.getHabits,
    currentUser ? { userId: currentUser?._id } : "skip"
  );
  const [selectedView, setSelectedView] = useState<"Daily" | "Weekly" | "Overall">("Daily");
  const [isLoadingView, setIsLoadingView] = useState<"Daily" | "Weekly" | "Overall" | null>(null);
  const logEntry = useMutation(api.habits.logEntry);

  const handleLogEntry = async (
    habitId: string,
    value: number | boolean | string,
    notes: string
  ) => {
    await logEntry({
      habitId: habitId as Id<"habits">,
      value,
      notes,
      date: new Date().toISOString().split("T")[0],
    });
  };

  if (!habits) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!habits || habits.length === 0) {
    return <EmptyHabitState />;
  }

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: "600" }}>
                  Your{" "}
                </Text>
                <Text style={{ color: Colors.mainBlue, fontSize: 20, fontWeight: "600" }}>
                  Habits
                </Text>
              </View>
            ),
            headerStyle: {
              backgroundColor: Colors.PitchBlack,
            },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: 16, paddingEnd: 10 }}
              >
                <IconCircle name="chevron-back-sharp" size={17} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", gap: 15, marginRight: 16 }}>
                <TouchableOpacity onPress={() => router.push("/(details)/createHabit")}>
                  <IconCircle name="add" size={17} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/(details)/habsettings")}>
                  <IconCircle name="settings" size={17} />
                </TouchableOpacity>
              </View>
            ),
            headerTintColor: Colors.white,
          }}
        />

        <View style={{ marginTop: 15 }}>
          <SliderSelector
            buttons={[
              {
                icon: (props) => (
                  <MaterialCommunityIcons name="calendar-today" size={props.size} color={props.color} />
                ),
                color: Colors.white,
                label: "Daily",
              },
              {
                icon: (props) => (
                  <MaterialCommunityIcons name="calendar-week" size={props.size} color={props.color} />
                ),
                color: Colors.white,
                label: "Weekly",
              },
              {
                icon: (props) => (
                  <MaterialCommunityIcons name="chart-arc" size={props.size} color={props.color} />
                ),
                color: Colors.white,
                label: "Overall",
              },
            ]}
            selectedIndex={["Daily", "Weekly", "Overall"].indexOf(selectedView)}
            onSelect={(index) => {
              const views = ["Daily", "Weekly", "Overall"] as const;
              const newView = views[index];
              setIsLoadingView(newView);
              setTimeout(() => {
                setSelectedView(newView);
                setIsLoadingView(null);
              }, 1000);
            }}
          />
        </View>

        {isLoadingView ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SwipeListView<Habit>
              data={habits}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item: habit }) =>
                selectedView === "Overall" ? (
                  <ContributionGrid habit={habit} />
                ) : (
                  <HabitCard
                    habit={habit}
                    onPress={() => router.push({
                      pathname: "/(details)/detailsHabit",
                      params: { id: habit._id }
                    })}
                    selectedView={selectedView}
                    handleLogEntry={handleLogEntry}
                  />
                )
              }
              useNativeDriver={true}
              leftOpenValue={50}
              rightOpenValue={-50}
              disableLeftSwipe={false}
              disableRightSwipe={false}
              previewRowKey={"1"}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              contentContainerStyle={{ paddingVertical: 10 }}
              style={{ marginTop: 10 }}
              removeClippedSubviews={false}
            />
          </GestureHandlerRootView>
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
    alignItems: "center",
    marginBottom: 120,
  },
});

// Add a separate StyleSheet for swipe-related styles
const swipeStyles = StyleSheet.create({
  rowBack: {
    alignItems: "center",
    backgroundColor: "black",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    width: CARD_WIDTH - 40,
    alignSelf: "center",
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    backgroundColor: "red",
    borderRadius: 25,
  },
  backRightBtnRight: {
    backgroundColor: "green",
    right: 0,
  },
  backLeftBtn: {
    backgroundColor: "red",
    left: 0,
    width: 75,
    borderRadius: 25,
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
  },
  backTextWhite: {
    color: "#FFF",
  },
});

const btnSize = 60;
const btnRadius = 12;
const cardMargin = 20;

const styles3 = StyleSheet.create({
  // ... your existing styles

  hiddenContainer: {
    width: CARD_WIDTH - 2 * cardMargin, // match your card width
    height: btnSize + 10,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: cardMargin,
    borderRadius: 25,
    overflow: "hidden",
  },
  hiddenButton: {
    width: "49%",
    height: btnSize,
    borderRadius: btnRadius,
    justifyContent: "flex-start",
    alignItems: "center",
    elevation: 2,
  },
  skipButton: {
    backgroundColor: "#E74C3C", // red
  },
  completeButton: {
    backgroundColor: "#27AE60", // green
  },
});

export default HabitDashboard;
