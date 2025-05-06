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
// TO ADD: // Precompute lightened colors in habit creation
//habit name and frequency in header in weekdays with right icons for edit delete and share
//display  total , score percent ,in a card
//display description in a card ,
//display linechart of progress  aand a notes section with add note button

const { width: screenWidth } = Dimensions.get("window");
const COLOR_PALETTE = [
  "#e6ac00",
  "#2eb8b8",
  "#1a8cff",
  "#d31912",
  "#6a4c93",
  "#2eb8b8",
  "#999900",
  "#cc6600",
];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const ICONS = [
  "water",
  "medkit",
  "fitness",
  "fast-food",
  "moon",
  "bicycle",
  "walk",
  "bed",
  "leaf",
  "book",
  "school",
  "heart",
  "heart",
];

export const mockHabits: Habit[] = [
  {
    _id: "1",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[0],
    icon: ICONS[0],
    entries: [
      { date: "2025-03-01", value: 8, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 8, notes: "Travel day" },
      ...Array.from({ length: 15 }, (_, i) => ({
        date: `2025-03-${(4 + i).toString().padStart(2, "0")}`,
        value: 8,
        notes: "Completed target",
      })),
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "2",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[1],
    icon: ICONS[1],
    entries: [
      { date: "2025-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 6, notes: "Travel day" },
      ...Array.from({ length: 15 }, (_, i) => ({
        date: `2025-03-${(4 + i).toString().padStart(2, "0")}`,
        value: 8,
        notes: "Completed target",
      })),
    ],
    streak: 15,
    progress: { current: 135, target: 144 },
  },
  {
    _id: "3",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[2],
    icon: ICONS[2],
    entries: [
      { date: "2025-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "4",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[3],
    icon: ICONS[3],
    entries: [
      { date: "2025-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "5",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[4],
    icon: ICONS[4],
    entries: [
      { date: "2025-03-01", value: 8, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 8, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "6",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[5],
    icon: ICONS[5],
    entries: [
      { date: "2025-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "7",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[6],
    icon: ICONS[2],
    entries: [
      { date: "2025-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "8",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[7],
    icon: ICONS[5],
    entries: [
      { date: "2025-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2025-03-02", value: 8 },
      { date: "2025-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
];

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
      <StatusBar style="dark" />

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

const HabitDashboard = () => {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [selectedView, setSelectedView] = useState<"Daily" | "Weekly" | "Overall">("Daily");
  const [isLoadingView, setIsLoadingView] = useState<"Daily" | "Weekly" | "Overall" | null>(null);

  const handleCreateHabit = (
    newHabit: Omit<Habit, "_id" | "entries" | "streak" | "progress">
  ) => {
    const habit: Habit = {
      ...newHabit,
      _id: Math.random().toString(36).substr(2, 9),
      entries: [],
      streak: 0,
      progress: {
        current: 0,
        target: newHabit.type === "numeric" ? newHabit.target || 0 : 0,
      },
    };
    setHabits((prev) => [...prev, habit]);
    setShowCreatePage(false);
  };

  const HiddenRow = ({
    onComplete,
    onSkip,
  }: {
    onComplete: () => void;
    onSkip: () => void;
  }) => (
    <View style={styles3.hiddenContainer}>
      <TouchableOpacity
        style={[styles3.hiddenButton, styles3.skipButton]}
        onPress={onSkip}
      >
        <MaterialCommunityIcons name="close" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles3.hiddenButton, styles3.completeButton]}
        onPress={onComplete}
      >
        <MaterialCommunityIcons name="check" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const handleLogEntry = (
    habitId: string,
    value: number | boolean | string,
    notes: string
  ) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit._id === habitId) {
          const newEntry = {
            date: new Date().toISOString().split("T")[0],
            value,
            notes,
          };
          const updatedEntries = [...habit.entries, newEntry];
          return {
            ...habit,
            entries: updatedEntries,
            progress: calculateProgress(habit, updatedEntries),
            streak: calculateStreak(updatedEntries),
          };
        }
        return habit;
      })
    );
  };

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '600' }}>Your </Text>
                <Text style={{ color: Colors.mainBlue, fontSize: 20, fontWeight: '600' }}>Habits</Text>
              </View>
            ),
            headerStyle: {
              backgroundColor: Colors.PitchBlack,
            },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 ,paddingEnd: 10}}>
                <IconCircle name="chevron-back-sharp" size={17} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 15, marginRight: 16 }}>
                <TouchableOpacity onPress={() => setShowCreatePage(true)}>
                  <IconCircle name="add" size={17} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <IconCircle name="settings" size={17} />
                </TouchableOpacity>
              </View>
            ),
            headerTintColor: Colors.white,
          }}
        />

        {showCreatePage ? (
          <HabitCreationScreen
            onCreate={handleCreateHabit}
            onClose={() => setShowCreatePage(false)}
          />
        ) : selectedHabit ? (
          <HabitDetail
            habit={selectedHabit}
            onClose={() => setSelectedHabit(null)}
          />
        ) : (
          <>
            <View style={{ marginTop: 15 }}>
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
              <SwipeListView<Habit>
                data={habits}
                keyExtractor={(item: Habit) => item._id}
                renderItem={({ item: habit }: ListRenderItemInfo<Habit>) =>
                  selectedView === "Overall" ? (
                    <ContributionGrid habit={habit} />
                  ) : (
                    <HabitCard
                      habit={habit}
                      onPress={() => setSelectedHabit(habit)}
                      selectedView={selectedView}
                      handleLogEntry={handleLogEntry}
                    />
                  )
                }
                renderHiddenItem={({ item }: ListRenderItemInfo<Habit>) => (
                  <HiddenRow
                    onComplete={() => handleLogEntry(item._id, true, "Completed via swipe")}
                    onSkip={() => handleLogEntry(item._id, false, "Skipped via swipe")}
                  />
                )}
                leftOpenValue={50}
                rightOpenValue={-50}
                disableLeftSwipe={false}
                disableRightSwipe={false}
                previewRowKey={"1"}
                previewOpenValue={-40}
                previewOpenDelay={3000}
                contentContainerStyle={{ paddingVertical: 10 }}
                style={{ marginTop: 10 }}
              />
            )}
          </>
        )}
      </View>
    </Provider>
  );
};

const { width: CARD_WIDTH } = Dimensions.get("window");

const HabitCard = React.memo(
  ({
    habit,
    onPress,
    selectedView,
    handleLogEntry,
  }: {
    habit: Habit;
    onPress: () => void;
    selectedView: "Daily" | "Weekly" | "Overall";
    handleLogEntry: (
      id: string,
      value: boolean | number | string,
      notes: string
    ) => void;
  }) => {
    const lighterColor1 = lightenColor(habit.color, 10);
    const lighterColor2 = lightenColor(habit.color, 15);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        translateX.value = gestureState.dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 100) {
          opacity.value = withTiming(0, { duration: 200 });
          translateX.value = withTiming(gestureState.dx * 2, { duration: 200 });

          // Handle completion action after animation
          setTimeout(() => {
            if (gestureState.dx > 0) {
              // Swipe right - mark as done
              handleLogEntry(habit._id, true, "Completed via swipe");
            } else {
              // Swipe left - skip
              handleLogEntry(habit._id, false, "Skipped via swipe");
            }
            // Reset animation values
            translateX.value = 0;
            opacity.value = 1;
          }, 200);
        } else {
          // Return to original position
          translateX.value = withSpring(0);
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[animatedStyle, { width: "100%", alignItems: "center" }]}
      >
        <TouchableOpacity
          onPress={onPress}
          style={styles.card}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[habit.color, lighterColor1, lighterColor2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.card, {marginTop:-10, borderRadius: 25 }]}
          >
            <View style={styles.cardHeader}>
              <IconCircle name={habit.icon} size={24} iconColor="#fff" />
              <Text style={styles.cardTitle}>{habit.name}</Text>
              <Text style={[styles.streakText, { marginLeft: "auto" }]}>
                {habit.streak}🔥
              </Text>
            </View>

            {selectedView !== "Daily" && (
              <>
                {habit.type === "numeric" && (
                  <ProgressBar
                    progress={habit.progress.current / (habit.target || 1)}
                    color="#fff"
                    style={styles.progressBar}
                  />
                )}

                <View style={styles.frequencyContainer}>
                  {DAYS.map((day) => (
                    <Text
                      key={`${habit._id}-${day}`}
                      style={[
                        styles.frequencyDay,
                        habit.frequency.includes(day) &&
                          styles.frequencyDayActive,
                      ]}
                    >
                      {day[0].toUpperCase()}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Helper Functions
const calculateProgress = (habit: Habit, entries: Entry[]) => {
  if (habit.type === "numeric") {
    const current = entries.reduce(
      (sum, entry) => sum + (entry.value as number),
      0
    );
    return { current, target: habit.target! };
  }
  if (habit.type === "boolean") {
    const current = entries.filter((e) => e.value === true).length;
    return { current, target: entries.length };
  }
  return { current: 0, target: 0 };
};

const calculateStreak = (entries: Entry[]) => {
  let streak = 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const entry of sorted) {
    if (entry.value === true) streak++;
    else break;
  }
  return streak;
};

const parseValueBasedOnType = (value: string, type: HabitType) => {
  switch (type) {
    case "numeric":
      return Number(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
};

// Function to lighten a color
const lightenColor = (color: string, percent: number) => {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);

  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00ff) + amt, 255);
  const B = Math.min((num & 0x0000ff) + amt, 255);

  return `#${[R, G, B].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

// Styles
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH - 40,
    borderRadius: 25,
    padding: 16,
    marginVertical: -5,
    alignSelf: "center",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    color: "#fff",
    paddingLeft: 15,
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 10,
  },
  streakText: {
    color: "#fff",
    marginBottom: 10,
    fontWeight: "600",
  },
  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  frequencyDay: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  frequencyDayActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  logButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    padding: 20,
    color: "#2d3436",
    backgroundColor: "#fff",
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modalContainer: {
    padding: 0,
    margin: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "rgb(0, 0, 0)",
  },
  chart: {
    height: 200,
    marginVertical: 16,
    borderRadius: 12,
  },
  input: {
    marginVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fcba03",
  },
  booleanContainer: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
  },
  chip: {
    flex: 1,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 40,
    marginTop: 20,
    marginBottom: 20,
    paddingLeft: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
  },
  creationModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    // maxWidth: 500,
    // maxHeight: Dimensions.get('window').height * 0.8,
    alignSelf: "center",
    // width: '90%',
    borderWidth: 1,
    borderColor: "#fcba03",
  },
  creationModalContent: {
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
    color: "#2d3436",
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  dayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#b2bec3",
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
  },
  selectedColor: {
    backgroundColor: "#e0e0e0",
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  radioGroup: {
    marginVertical: 8,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  backButton: {
    marginRight: 16,
  },
  detailTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  detailContent: {
    padding: 16,
  },
  cardStyle: {
    width: CARD_WIDTH - 40,
    height: 200,
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: "center",
  },
  loadingCard: {
    width: CARD_WIDTH - 40,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 25,
  },
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
    width: CARD_WIDTH - 2 * cardMargin,   // match your card width
    height: btnSize+10,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: cardMargin,
    borderRadius: 25,
    overflow: 'hidden',
  },
  hiddenButton: {
    width: "49%",
    height: btnSize,
    borderRadius: btnRadius,
    justifyContent: 'flex-start',
    alignItems:'center',
    elevation: 2,
  },
  skipButton: {
    backgroundColor: '#E74C3C',  // red
  },
  completeButton: {
    backgroundColor: '#27AE60',  // green
  },
});


export default HabitDashboard;
