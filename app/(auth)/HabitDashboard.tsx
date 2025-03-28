import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Button,
  TextInput,
  FlatList,
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
} from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { HabitCreationScreen } from "~/components/HabitCreationScreen";
import IconCircle from "~/components/IconCircle";
import LinearGradient from "react-native-linear-gradient";
import ContributionGrid from "~/components/ContributionGrid";

type HabitType = "boolean" | "numeric" | "categorical";

interface Habit {
  _id: string;
  name: string;
  type: HabitType;
  target?: number;
  unit?: string;
  frequency: string[];
  color: string;
  icon: string;
  entries: Entry[];
  streak: number;
  progress: { current: number; target: number };
}

// TO ADD: // Precompute lightened colors in habit creation
//habit name and frequency in header in weekdays with right icons for edit delete and share
//display  total , score percent ,in a card
//display description in a card ,
//display linechart of progress  aand a notes section with add note button

interface Entry {
  date: string;
  value: number | boolean | string;
  notes?: string;
}

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

const mockHabits: Habit[] = [
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
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
}

const HeaderWithButtons = ({
  habits,
  showCreatePage,
  setShowCreatePage,
  selectedView,
  setSelectedView,
  setSelectedHabit,
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
          <TouchableOpacity onPress={() => setShowCreatePage(true)}>
            <IconCircle name="add" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 10 }}>
            <IconCircle name="settings" size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles1.buttonRowContainer, buttonRowStyle]}>
        <View style={styles1.buttonRow}>
          <ViewSelectorButton
            label="Daily"
            selected={selectedButton === "Daily"}
            onPress={() => {
              setSelectedButton("Daily");
              setSelectedView("Daily");
            }}
          />
          <ViewSelectorButton
            label="Weekly"
            selected={selectedButton === "Weekly"}
            onPress={() => {
              setSelectedButton("Weekly");
              setSelectedView("Weekly");
            }}
          />
          <ViewSelectorButton
            label="Overall"
            selected={selectedButton === "Overall"}
            onPress={() => {
              setSelectedButton("Overall");
              setSelectedView("Overall");
            }}
          />
        </View>
      </Animated.View>
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
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [selectedView, setSelectedView] = useState<
    "Daily" | "Weekly" | "Overall"
  >("Daily");

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
      <View style={{ flex: 1 }}>
        <HeaderWithButtons
          habits={habits}
          showCreatePage={showCreatePage}
          setShowCreatePage={setShowCreatePage}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          setSelectedHabit={setSelectedHabit}
        />

        <Portal>
          <Modal
            visible={showCreatePage}
            onDismiss={() => setShowCreatePage(false)}
            contentContainerStyle={{
              flex: 1,
              width: "100%",
              height: "100%",
              padding: 0,
            }}
          >
            <HabitCreationScreen
              onCreate={handleCreateHabit}
              onClose={() => setShowCreatePage(false)}
            />
          </Modal>
        </Portal>

        {selectedHabit && (
          <Modal
            visible={!!selectedHabit}
            onDismiss={() => setSelectedHabit(null)}
            contentContainerStyle={styles.modalContainer}
          >
            <HabitDetailModal
              habit={selectedHabit}
              onClose={() => setSelectedHabit(null)}
              onLogEntry={handleLogEntry}
            />
          </Modal>
        )}

        <Animated.FlatList
          data={habits}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            selectedView === "Overall" ? (
              <ContributionGrid habit={item} />
            ) : (
              <HabitCard habit={item} onPress={() => setSelectedHabit(item)} />
            )
          }
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: HEADER_EXPANDED_HEIGHT + BUTTON_ROW_HEIGHT + 10,
            paddingHorizontal: 16,
            paddingBottom: 50,
          }}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={11}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100}
        />
      </View>
    </Provider>
  );
};

const { width: CARD_WIDTH } = Dimensions.get("window");

const HabitCard = React.memo(
  ({ habit, onPress }: { habit: Habit; onPress: () => void }) => {
    // Create lighter shades of the habit color
    const lighterColor1 = lightenColor(habit.color, 5); // First lighter shade
    const lighterColor2 = lightenColor(habit.color, 10); // Second lighter shade

    return (
      <TouchableOpacity onPress={onPress} style={styles.card}>
        <LinearGradient
          colors={[habit.color, lighterColor1, lighterColor2]} // Use three shades in the gradient
          start={{ x: 0, y: 0 }} // Start from the left
          end={{ x: 1, y: 0 }} // End at the right
          style={[styles.card, { borderRadius: 25 }]} // Ensure the gradient covers the card
        >
          <View style={styles.cardHeader}>
            <IconCircle name={habit.icon} size={24} iconColor="#fff" />
            <Text style={styles.cardTitle}>{habit.name}</Text>
          </View>

          {habit.type === "numeric" && (
            <ProgressBar
              progress={habit.progress.current / (habit.target || 1)}
              color="#fff"
              style={styles.progressBar}
            />
          )}

          {habit.type === "boolean" && (
            <Text style={styles.streakText}>{habit.streak} day streak!</Text>
          )}

          <View style={styles.frequencyContainer}>
            {DAYS.map((day) => (
              <Text
                key={`${habit._id}-${day}`}
                style={[
                  styles.frequencyDay,
                  habit.frequency.includes(day) && styles.frequencyDayActive,
                ]}
              >
                {day[0].toUpperCase()}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
);

const HabitDetailModal = ({
  habit,
  onClose,
  onLogEntry,
}: {
  habit: Habit;
  onClose: () => void;
  onLogEntry: (
    habitId: string,
    value: number | boolean | string,
    notes: string
  ) => void;
}) => {
  const [logValue, setLogValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!logValue.trim()) return;
    const parsedValue = parseValueBasedOnType(logValue, habit.type);
    onLogEntry(habit._id, parsedValue, notes);
    onClose();
  };

  return (
    <Surface style={styles.modalContent}>
      <Text style={styles.modalTitle}>{habit.name} Progress</Text>

      {/* <LineChart
        style={styles.chart}
        data={{
          dataSets: [
            {
              label: habit.name,
              values: habit.entries.map((e) => ({
                x: new Date(e.date).getTime(),
                y: typeof e.value === "number" ? e.value : 0,
              })),
              config: {
                color: habit.color,
                drawValues: false,
                lineWidth: 2,
              },
            },
          ],
        }}
        xAxis={{
          valueFormatter: habit.entries.map((e) =>
            new Date(e.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          ),
          position: "BOTTOM",
          granularity: 1,
        }}
      /> */}

      {habit.type === "numeric" && (
        <TextInput
          placeholder={`Amount (${habit.unit})`}
          keyboardType="numeric"
          value={logValue}
          onChangeText={setLogValue}
          style={styles.input}
        />
      )}

      {habit.type === "boolean" && (
        <View style={styles.booleanContainer}>
          <Chip
            selected={logValue === "true"}
            onPress={() => setLogValue("true")}
            style={styles.chip}
          >
            Completed
          </Chip>
          <Chip
            selected={logValue === "false"}
            onPress={() => setLogValue("false")}
            style={styles.chip}
          >
            Missed
          </Chip>
        </View>
      )}

      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        style={styles.input}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onClose} style={styles.button}>
          Cancel
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, { backgroundColor: habit.color }]}
          disabled={!logValue}
        >
          <Text style={{ color: "white" }}>Save Entry</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

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
    marginVertical: 0,
    alignSelf: "center",
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
    backgroundColor: "#f8f9fa",
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
    color: "#2d3436",
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
});

// Memoize habit components to prevent unnecessary re-renders
const ViewSelectorButton = React.memo(
  ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => {
    // Replace Animated.View with simpler implementation
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(selected ? 1.05 : 1) }],
    }));

    return (
      <TouchableOpacity
        style={[styles1.button, selected && styles1.selectedButton]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Animated.Text style={[styles1.buttonText, animatedStyle]}>
          {label}
        </Animated.Text>
      </TouchableOpacity>
    );
  }
);

export default HabitDashboard;
