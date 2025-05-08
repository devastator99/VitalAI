// SettingsScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Linking } from "react-native";
import {
  Provider,
  Card,
  Text,
  Switch,
  Divider,
  TextInput,
  RadioButton,
  Chip,
  Button,
  Portal,
  Dialog,
  List,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";


type HabitType = "boolean" | "numeric" | "categorical";
type FrequencyOption = "Daily" | "Weekdays" | "Custom";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const SettingsScreen = ({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<SettingsType>;
  onSave: (s: SettingsType) => void;
  onClose: () => void;
}) => {
  // 1. Notifications & Reminders
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    !!initial?.notificationsEnabled
  );
  const [morningTime, setMorningTime] = useState<Date>(
    initial?.morningTime ?? (new Date().setHours(8, 0, 0, 0) as unknown as Date)
  );
  const [eveningTime, setEveningTime] = useState<Date>(
    initial?.eveningTime ??
      (new Date().setHours(18, 0, 0, 0) as unknown as Date)
  );
  const [quietStart, setQuietStart] = useState<Date>(
    initial?.quietStart ?? (new Date().setHours(22, 0, 0, 0) as unknown as Date)
  );
  const [quietEnd, setQuietEnd] = useState<Date>(
    initial?.quietEnd ?? (new Date().setHours(7, 0, 0, 0) as unknown as Date)
  );
  const [pickerMode, setPickerMode] = useState<
    "morning" | "evening" | "quietStart" | "quietEnd" | null
  >(null);

  // 2. Default Habit Preferences
  const [defaultType, setDefaultType] = useState<HabitType>(
    initial?.defaultType ?? "boolean"
  );
  const [defaultTarget, setDefaultTarget] = useState<string>(
    initial?.defaultTarget?.toString() ?? ""
  );
  const [defaultUnit, setDefaultUnit] = useState<string>(
    initial?.defaultUnit ?? ""
  );
  const [defaultFreqOption, setDefaultFreqOption] = useState<FrequencyOption>(
    initial?.defaultFrequencyOption ?? "Daily"
  );
  const [customDays, setCustomDays] = useState<string[]>(
    initial?.defaultCustomDays ?? []
  );

  // 4. Privacy & Security
  const [passcodeEnabled, setPasscodeEnabled] = useState<boolean>(
    !!initial?.passcodeEnabled
  );

  // 5. Help & About (static)
  const version = "1.0.0";

  // Confirm “Clear All Data”
  const [confirmVisible, setConfirmVisible] = useState(false);

  const toggleCustomDay = (d: string) =>
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleConfirmClear = () => {
    setConfirmVisible(false);
    // emit a special flag version of SettingsType
    onSave({ ...gather(), clearAllData: true });
  };

  const gather = (): SettingsType => ({
    notificationsEnabled,
    morningTime,
    eveningTime,
    quietStart,
    quietEnd,
    defaultType,
    defaultTarget:
      defaultType === "numeric" ? Number(defaultTarget) : undefined,
    defaultUnit: defaultType === "numeric" ? defaultUnit : undefined,
    defaultFrequencyOption: defaultFreqOption,
    defaultCustomDays: defaultFreqOption === "Custom" ? customDays : [],
    passcodeEnabled,
    // clearAllData is only set when user confirms
    clearAllData: false,
  });

  const handleSave = () => onSave(gather());

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 1. Notifications & Reminders */}
        <Card style={styles.card}>
          <Card.Title title="Reminders" />
          {/* <Card.Content>
            <View style={styles.row}>
              <Text>Enable Reminders</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>

            {notificationsEnabled && (
              <>
                <Divider style={styles.divider} />
                {[
                  { label: "Morning Reminder", key: "morning" },
                  { label: "Evening Reminder", key: "evening" },
                  { label: "Quiet Hours Start", key: "quietStart" },
                  { label: "Quiet Hours End", key: "quietEnd" },
                ].map(({ label, key }) => (
                  <TouchableRow
                    key={key}
                    label={label}
                    value={
                      key === "morning"
                        ? formatTime(morningTime)
                        : key === "evening"
                          ? formatTime(eveningTime)
                          : key === "quietStart"
                            ? formatTime(quietStart)
                            : formatTime(quietEnd)
                    }
                    onPress={() => setPickerMode(key as any)}
                  />
                ))}
                {pickerMode !== null && (
                  <DateTimePicker
                    value={
                      pickerMode === "morning"
                        ? morningTime
                        : pickerMode === "evening"
                          ? eveningTime
                          : pickerMode === "quietStart"
                            ? quietStart
                            : quietEnd
                    }
                    mode="time"
                    display="default" // or "spinner" / "clock" per your preference
                    onChange={(_, selectedDate) => {
                      // hide picker
                      setPickerMode(null);

                      // if user confirmed a time, update the corresponding state
                      if (selectedDate) {
                        if (pickerMode === "morning")
                          setMorningTime(selectedDate);
                        else if (pickerMode === "evening")
                          setEveningTime(selectedDate);
                        else if (pickerMode === "quietStart")
                          setQuietStart(selectedDate);
                        else setQuietEnd(selectedDate);
                      }
                    }}
                  />
                )}
              </>
            )}
          </Card.Content> */}
        </Card>

        {/* 2. Default Habit Preferences */}
        <Card style={styles.card}>
          <Card.Title title="New-Habit Defaults" />
          <Card.Content>
            <Text style={styles.label}>Type</Text>
            <RadioButton.Group
              onValueChange={(v) => setDefaultType(v as HabitType)}
              value={defaultType}
            >
              <View style={styles.row}>
                <RadioButton value="boolean" />
                <Text>Yes/No</Text>
                <RadioButton value="numeric" />
                <Text>Numeric</Text>
                <RadioButton value="categorical" />
                <Text>Category</Text>
              </View>
            </RadioButton.Group>

            {defaultType === "numeric" && (
              <>
                <TextInput
                  label="Target"
                  mode="outlined"
                  keyboardType="numeric"
                  value={defaultTarget}
                  onChangeText={setDefaultTarget}
                  style={styles.input}
                />
                <TextInput
                  label="Unit"
                  mode="outlined"
                  value={defaultUnit}
                  onChangeText={setDefaultUnit}
                  style={styles.input}
                />
              </>
            )}

            <Divider style={styles.divider} />

            <Text style={styles.label}>Frequency</Text>
            <RadioButton.Group
              onValueChange={(v) => setDefaultFreqOption(v as FrequencyOption)}
              value={defaultFreqOption}
            >
              <View style={styles.row}>
                <RadioButton value="Daily" />
                <Text>Daily</Text>
                <RadioButton value="Weekdays" />
                <Text>Mon–Fri</Text>
                <RadioButton value="Custom" />
                <Text>Custom</Text>
              </View>
            </RadioButton.Group>

            {defaultFreqOption === "Custom" && (
              <View style={styles.wrap}>
                {DAYS.map((d) => (
                  <Chip
                    key={d}
                    selected={customDays.includes(d)}
                    onPress={() => toggleCustomDay(d)}
                    style={styles.chip}
                  >
                    {d}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 3. Data Management */}
        <Card style={styles.card}>
          <Card.Title title="Data Management" />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => onSave({ ...gather(), exportData: true })}
              style={styles.mb}
            >
              Export All Data
            </Button>
            <Button
              mode="outlined"
              onPress={() => setConfirmVisible(true)}
              color="red"
            >
              Clear All Data
            </Button>
          </Card.Content>
        </Card>

        {/* 4. Privacy & Security */}
        <Card style={styles.card}>
          <Card.Title title="Privacy & Security" />
          <Card.Content>
            <View style={styles.row}>
              <Text>Passcode / Biometric</Text>
              <Switch
                value={passcodeEnabled}
                onValueChange={setPasscodeEnabled}
              />
            </View>
          </Card.Content>
        </Card>

        {/* 5. Help & About */}
        <Card style={styles.card}>
          <Card.Title title="Help & About" />
          <Card.Content>
            <List.Item
              title="App Version"
              description={version}
              left={(p) => <List.Icon {...p} icon="information" />}
            />
            <List.Item
              title="Contact Support"
              left={(p) => <List.Icon {...p} icon="email" />}
              onPress={() => Linking.openURL("mailto:support@example.com")}
            />
            <List.Item
              title="Rate This App"
              left={(p) => <List.Icon {...p} icon="star" />}
              onPress={() => Linking.openURL("market://details?id=com.yourapp")}
            />
          </Card.Content>
        </Card>

        {/* Save / Close */}
        <View style={styles.actions}>
          <Button onPress={onClose}>Cancel</Button>
          <Button mode="contained" onPress={handleSave}>
            Save Settings
          </Button>
        </View>

        {/* Clear-All Confirmation */}
        <Portal>
          <Dialog
            visible={confirmVisible}
            onDismiss={() => setConfirmVisible(false)}
          >
            <Dialog.Title>Clear All Data?</Dialog.Title>
            <Dialog.Content>
              <Text>
                This will permanently delete all your habits & entries.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmVisible(false)}>No</Button>
              <Button onPress={handleConfirmClear}>Yes, Clear</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
};

// Helper row with label + value + chevron
const TouchableRow = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <List.Item
    title={label}
    description={value}
    onPress={onPress}
    right={(p) => <List.Icon {...p} icon="chevron-right" />}
  />
);

type SettingsType = {
  notificationsEnabled: boolean;
  morningTime: Date;
  eveningTime: Date;
  quietStart: Date;
  quietEnd: Date;
  defaultType: HabitType;
  defaultTarget?: number;
  defaultUnit?: string;
  defaultFrequencyOption: FrequencyOption;
  defaultCustomDays: string[];
  passcodeEnabled: boolean;
  exportData?: boolean;
  clearAllData?: boolean;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    marginBottom: 12,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    margin: 4,
  },
  mb: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
});
