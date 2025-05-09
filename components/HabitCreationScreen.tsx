import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput as RNTextInput,
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
  Snackbar,
} from "react-native-paper";
import { COLOR_PALETTE, DAYS, ICONS } from "./habit_components/habit_icons";
import ScreenTransitionView from "./ScreenTransitionView";
type HabitType = "boolean" | "numeric" | "categorical";
import { Habit } from "~/utils/Interfaces";

const { height, width } = Dimensions.get("window");

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
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HabitType>("numeric");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState<string[]>([]);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const showError = (msg: string) => {
    setSnackbarMsg(msg);
    setSnackbarVisible(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      showError("Please enter a habit name.");
      return;
    }
    if (type === "numeric") {
      if (!target || !unit.trim()) {
        showError("For numeric habits, you must set a target and a unit.");
        return;
      }
    }
    // if all OK, build and submit
    const newHabit = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      target: type === "numeric" ? Number(target) : undefined,
      unit: type === "numeric" ? unit.trim() : undefined,
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
      <ScreenTransitionView style={{ flex: 1 }}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>
              Habit Name <Text style={styles.required}>*</Text>
            </Text>
            <RNTextInput
              placeholder="Enter habit name"
              placeholderTextColor={color}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                { borderColor: color, backgroundColor: color + "22" },
              ]}
            />

            <Text style={styles.label}>Description (optional)</Text>
            <RNTextInput
              placeholder="Enter a short description"
              placeholderTextColor={color}
              value={description}
              onChangeText={setDescription}
              style={[
                styles.input,
                { borderColor: color, backgroundColor: color + "22" },
              ]}
            />

            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.radioRow}>
              <RadioButton.Group
                onValueChange={(v) => setType(v as HabitType)}
                value={type}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="numeric" />
                  <Text>Numeric</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="boolean" />
                  <Text>Yes/No</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="categorical" />
                  <Text>Category</Text>
                </View>
              </RadioButton.Group>
            </View>

            {type === "numeric" && (
              <>
                <Text style={styles.label}>
                  Daily Target <Text style={styles.required}>*</Text>
                </Text>
                <RNTextInput
                  placeholder="e.g. 30"
                  placeholderTextColor={color}
                  value={target}
                  onChangeText={setTarget}
                  style={[
                    styles.input,
                    { borderColor: color, backgroundColor: color + "22" },
                  ]}
                  keyboardType="numeric"
                />
                <Text style={styles.label}>
                  Unit <Text style={styles.required}>*</Text>
                </Text>
                <RNTextInput
                  placeholder="e.g. minutes, glasses"
                  placeholderTextColor={color}
                  value={unit}
                  onChangeText={setUnit}
                  style={[
                    styles.input,
                    { borderColor: color, backgroundColor: color + "22" },
                  ]}
                />
              </>
            )}

            <Text style={styles.sectionTitle}>Frequency</Text>
            <View style={styles.wrapRow}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[
                    styles.dayButton,
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
                      color: color,
                      fontWeight: "bold",
                    }}
                  >
                    {day[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.wrapRow}>
              {COLOR_PALETTE.map((c, idx) => (
                <TouchableOpacity
                  key={`${c}-${idx}`}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    color === c && styles.colorSelected,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Icon</Text>
            <View style={styles.wrapRow}>
              {ICONS.map((i, idx) => (
                <TouchableOpacity
                  key={`${i}-${idx}`}
                  onPress={() => setIcon(i)}
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        icon === i ? color + "33" : "transparent",
                    },
                  ]}
                >
                  <Icon source={i} size={24} color={icon === i ? color : "#666"} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Fixed Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.createButton,
                {
                  backgroundColor: color,
                  opacity:
                    !name.trim() || (type === "numeric" && (!target || !unit))
                      ? 0.6
                      : 1,
                },
              ]}
              disabled={
                !name.trim() || (type === "numeric" && (!target || !unit))
              }
            >
              <Text style={styles.createButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            style={{ backgroundColor: color }}
          >
            {snackbarMsg}
          </Snackbar>
        </View>
      </ScreenTransitionView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgba(0,0,0,1)" },
  content: { padding: 20, paddingBottom: 100 },
  label: { color: "#fff", fontSize: 16, marginBottom: 4 },
  required: { color: "#f00" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 16,
    color: "#fff",
    fontSize: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  radioItem: { flexDirection: "row", alignItems: "center" },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
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
    borderColor: "#fff",
  },
  iconBox: {
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
  },
  createButton: {
    width: "90%",
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
