import React, { forwardRef } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  withTiming,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Habit } from "~/utils/Interfaces";
import { LinearGradient } from "expo-linear-gradient";
import IconCircle from "~/components/IconCircle";
import { ProgressBar } from "react-native-paper";
import { DAYS } from "~/utils/habitData";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HabitCard = forwardRef<View, {
  habit: Habit;
  onPress: () => void;
  selectedView: "Daily" | "Weekly" | "Overall";
  handleLogEntry: (id: string, value: boolean | number | string, notes: string) => void;
}>(({ habit, onPress, selectedView, handleLogEntry }, ref) => {
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
      ref={ref}
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
          style={[styles.card, { marginTop: -10, borderRadius: 25 }]}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={habit.icon as any} size={24} color="#fff" />
            <Text style={styles.cardTitle}>{habit.name}</Text>
            <Text style={[styles.streakText, { marginLeft: "auto" }]}>
              {habit.streak}
            </Text>
            <MaterialCommunityIcons name="fire-circle" size={24} color="#fff" />
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
});

HabitCard.displayName = 'HabitCard';

// Function to lighten a color
const lightenColor = (color: string, percent: number) => {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);

  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00ff) + amt, 255);
  const B = Math.min((num & 0x0000ff) + amt, 255);

  return `#${[R, G, B].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const { width: CARD_WIDTH } = Dimensions.get("window");
// Styles
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH - 40,
    borderRadius: 25,
    padding: 16,
    marginVertical: -5,
    alignSelf: "center",
    elevation: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 2,
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
    marginBottom: 0,
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
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
  }
});

export default HabitCard;
