import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Button,
  TextInput,
} from "react-native";
import {
  ProgressBar,
  FAB,
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
import { COLOR_PALETTE, DAYS, ICONS } from "./habit_components/habit_icons";
import ScreenTransitionView from "./ScreenTransitionView";
type HabitType = "boolean" | "numeric" | "categorical";
import { Habit } from "~/utils/Interfaces";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;
export const HabitCreationScreen = ({
  onCreate,
  onClose,
}: {
  onCreate: (
    habit: Omit<Habit, "_id" | "entries" | "streak" | "progress">
  ) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("numeric");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState<string[]>([]);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newHabit = {
      name,
      type,
      target: type === "numeric" ? Number(target) : undefined,
      unit: type === "numeric" ? unit : undefined,
      frequency,
      color,
      icon,
    };

    onCreate(newHabit);
  };

  const toggleDay = (day: string) => {
    setFrequency((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Provider>
      <ScreenTransitionView style={{ flex: 1, marginTop: 10 }}>
        <View style={styles2.container}>
          <ScrollView contentContainerStyle={styles2.content}>
            <TextInput
              placeholder="Habit name"
              placeholderTextColor={color}
              value={name}
              onChangeText={setName}
              style={[
                styles2.input,
                {
                  borderColor: color,
                  backgroundColor: color + "22",
                  color: "#ffffff",
                },
              ]}
            />

            <TextInput
              style={[
                styles2.input,
                { borderColor: color },
                { backgroundColor: color + "22", color: "#ffffff" },
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={color}
              value={unit}
              onChangeText={setUnit}
            />

            <Text style={styles2.sectionTitle}>Type</Text>
            <View style={styles2.radioRow}>
              <RadioButton.Group
                onValueChange={(v) => setType(v as HabitType)}
                value={type}
              >
                <View style={styles2.radioItem}>
                  <RadioButton value="numeric" />
                  <Text>Numeric</Text>
                </View>
                <View style={styles2.radioItem}>
                  <RadioButton value="boolean" />
                  <Text>Yes/No</Text>
                </View>
                <View style={styles2.radioItem}>
                  <RadioButton value="categorical" />
                  <Text>Category</Text>
                </View>
              </RadioButton.Group>
            </View>

            {type === "numeric" && (
              <>
                <TextInput
                  style={[
                    styles2.input,
                    { borderColor: color },
                    { backgroundColor: color + "22", color: "#ffffff" },
                  ]}
                  placeholder="Daily Target"
                  value={target}
                  onChangeText={setTarget}
                  placeholderTextColor={color}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[
                    styles2.input,
                    { borderColor: color },
                    { backgroundColor: color + "22", color: "#ffffff" },
                  ]}
                  placeholder="Unit (e.g., minutes, glasses)"
                  value={unit}
                  placeholderTextColor={color}
                  onChangeText={setUnit}
                />
              </>
            )}

            <Text style={styles2.sectionTitle}>Frequency</Text>
            <View style={styles2.wrapRow}>
              {DAYS.map((day, index) => (
                <TouchableOpacity
                  key={`${day}-${index}`}
                  onPress={() => toggleDay(day)}
                  style={[
                    styles2.dayButton,
                    {
                      backgroundColor: frequency.includes(day)
                        ? color + "66"
                        : "transparent",
                      borderColor: color,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: frequency.includes(day) ? color : color,
                      fontWeight: "bold",
                    }}
                  >
                    {day[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles2.sectionTitle}>Color</Text>
            <View style={styles2.wrapRow}>
              {COLOR_PALETTE.map((c, index) => (
                <TouchableOpacity
                  key={`${c}-${index}`}
                  onPress={() => setColor(c)}
                  style={[
                    styles2.colorCircle,
                    { backgroundColor: c },
                    color === c && styles2.colorSelected,
                  ]}
                />
              ))}
            </View>

            <Text style={styles2.sectionTitle}>Icon</Text>
            <View style={styles2.wrapRow}>
              {ICONS.map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setIcon(i)}
                  style={[
                    styles2.iconBox,
                    {
                      backgroundColor:
                        icon === i ? color + "33" : "transparent",
                    },
                  ]}
                >
                  <Icon
                    source={i}
                    size={24}
                    color={icon === i ? color : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles2.buttonContainer}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles2.createButton,
                  { backgroundColor: color, width: "80%" },
                ]}
                disabled={
                  !name.trim() || (type === "numeric" && (!target || !unit))
                }
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Create Habit
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ScreenTransitionView>
    </Provider>
  );
};

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,1)",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    width: "90%",
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  wrapRow: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 12,
  },
  dayButton: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 40,
    marginRight: 8,
    marginBottom: 8,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: "#000",
  },
  iconBox: {
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 1,
  },
});
