import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  Pressable,
  Modal,
  Image,
  Alert,
} from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../utils/Colors";
import { Ionicons, MaterialIcons, AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { TimePickerModal } from "react-native-paper-dates";
import CustomPicker from "./CustomPicker";
import useLocation from "~/utils/useLocation";
import * as ImagePicker from "expo-image-picker";
import { Id } from "~/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useUser as useClerkUser } from "@clerk/clerk-expo";
import UserVector from "./UserVector";
import FastImage from "@d11/react-native-fast-image";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";
// import * as Location from 'expo-location';
// import * as Device from 'expo-device';

// Define the FormData interface
interface FormData {
  name: string;
  profilePicture?: Id<"_storage">;
  gender: string;
  age: string;
  height: string;
  weight: string;
  occupation: string;
  goals: string[];
  healthConditions: string[];
  symptoms: string[];
  allergies: string[];
  habits: string[];
  dietStyle: string;
  spiceLevel: string;
  texturePreferences: string[];
  foodsToAvoid: string[];
  cookingLevel: string;
  wakeUpTime: string | null;
  sleepTime: string | null;
  mealTimes: Record<"breakfast" | "lunch" | "snack" | "dinner", string | null>;
  heaviestMeal: string;
  activityLevel: string;
  workouts: {
    doWorkouts: boolean;
    days: string[];
    time: string | null;
    type: string;
    duration: string;
  };
  location: string;
  homeCuisine: string;
  otherCuisines: string[];
  primaryGoal: string;
  completedAt?: string;
}

// Define the MultiSelectProps interface
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
}

// Define the TimePickerProps interface
interface TimePickerProps {
  value: string | null;
  onChange: (time: string) => void;
  label: string;
}

// Add styles before component definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timePickerContainer: {
    marginBottom: 20,
  },
  timePickerLabel: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 8,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff08",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  timePickerButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  gradientContainer: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    marginVertical: 10,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginVertical: 15,
  },
  input: {
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    padding: 15,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  label: {
    color: Colors.mainBlue,
    fontSize: 16,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    marginBottom: 10,
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 10,
  },
  bmi: {
    marginTop: 15,
    fontSize: 18,
    color: Colors.white,
    textAlign: "center",
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    gap: 8,
  },
  progressDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  stepContainer: {
    backgroundColor: "#ffffff08",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffffff15",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 15,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 25,
    flex: 1,
    gap: 8,
  },
  nextButton: {
    borderRadius: 25,
    backgroundColor: Colors.mainBlue,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  multiSelectContainer: {
    gap: 10,
  },
  multiSelectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  multiSelectOptionSelected: {
    backgroundColor: "#ffffff15",
    borderColor: Colors.mainBlue,
  },
  multiSelectOptionText: {
    color: Colors.white,
    fontSize: 16,
  },
  multiSelectOptionTextSelected: {
    color: Colors.mainBlue,
    fontWeight: "600",
  },
  customInputWrapper: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
    marginBottom: 50,
  },
  customInput: {
    flex: 1,
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ffffff33",
    fontSize: 16,
  },
  customAddButton: {
    backgroundColor: Colors.mainBlue,
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff33",
    marginBottom: 15,
    overflow: "hidden",
  },
  pickerLabel: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff08",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  switchLabel: {
    color: Colors.white,
    fontSize: 16,
  },
  customSwitch: {
    transform: [{ scale: 1.2 }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: "#ff000015",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ff000033",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginBottom: 5,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  fieldError: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: "#ff6b6b",
    backgroundColor: "#ff000008",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#ffffff15",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 20,
    width: '100%',
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.mainBlue,
    borderRadius: 3,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepText: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  stepDescription: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
  },
  pickerItem: {
    color: Colors.white,
  },
  locButton: {
    marginLeft: 12,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  locationError: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  confirmationContainer: {
    gap: 20,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  goalsList: {
    gap: 8,
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff08",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  goalOptionSelected: {
    backgroundColor: "#ffffff15",
    borderColor: Colors.mainBlue,
  },
  goalText: {
    color: Colors.white,
    fontSize: 16,
  },
  goalTextSelected: {
    color: Colors.mainBlue,
    fontWeight: "600",
  },
  summarySection: {
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: Colors.white,
    opacity: 0.7,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  summaryList: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  approveButton: {
    backgroundColor: Colors.mainBlue,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  approveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    width: 120,
    height: 120,
    alignSelf: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.mainBlue,
  },
  emptyProfileContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.mainBlue,
    backgroundColor: "#ffffff08",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.mainBlue,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bmiContainer: {
    backgroundColor: "#ffffff08",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  bmiLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  bmiValue: {
    color: Colors.mainBlue,
    fontSize: 20,
    fontWeight: "700",
  },
  profileSkeleton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(50, 50, 50, 0.4)",
    borderRadius: 60,
  },
  profileLoader: {
    position: "absolute",
    zIndex: 2,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 5,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff15",
    marginLeft: 10,
  },
  skipButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
});

// Reusable MultiSelect Component
const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  allowCustom = false,
}) => {
  const [customInput, setCustomInput] = useState<string>("");

  const toggleOption = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];
    onChange(updated);
  };

  const addCustom = () => {
    if (customInput.trim() && !selected.includes(customInput.trim())) {
      onChange([...selected, customInput.trim()]);
      setCustomInput("");
    }
  };

  return (
    <View style={styles.multiSelectContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.multiSelectOption,
            selected.includes(option) && styles.multiSelectOptionSelected,
          ]}
          onPress={() => toggleOption(option)}
        >
          <Text
            style={[
              styles.multiSelectOptionText,
              selected.includes(option) && styles.multiSelectOptionTextSelected,
            ]}
          >
            {option}
          </Text>
          {selected.includes(option) && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.mainBlue}
            />
          )}
        </TouchableOpacity>
      ))}
      {allowCustom && (
        <View style={styles.customInputWrapper}>
          <TextInput
            style={[styles.customInput, { color: Colors.white }]}
            value={customInput}
            onChangeText={setCustomInput}
            placeholder="Add custom option..."
            placeholderTextColor="#ffffff66"
          />
          <TouchableOpacity
            style={[
              styles.customAddButton,
              !customInput.trim() && styles.disabledButton,
            ]}
            onPress={addCustom}
            disabled={!customInput.trim()}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Reusable TimePicker Component
const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label }) => {
  const [show, setShow] = useState(false);
  const currentValue = value ? new Date(value) : new Date();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.timePickerContainer}>
      <Text style={styles.timePickerLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.timePickerButton}
        onPress={() => setShow(true)}
      >
        <Text style={styles.timePickerButtonText}>
          {formatTime(currentValue)}
        </Text>
        <Ionicons name="time-outline" size={24} color={Colors.white} />
      </TouchableOpacity>

      <TimePickerModal
        visible={show}
        onDismiss={() => setShow(false)}
        onConfirm={({ hours, minutes }: { hours: number; minutes: number }) => {
          const selected = new Date();
          selected.setHours(hours, minutes);
          onChange(selected.toISOString());
          setShow(false);
        }}
        hours={currentValue.getHours()}
        minutes={currentValue.getMinutes()}
        label="Pick time"
        uppercase={false}
        cancelLabel="Cancel"
        confirmLabel="OK"
        use24HourClock={true}
      />
    </View>
  );
};

// Define the StepComponentProps interface
interface StepComponentProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

// Add FormField component for consistent styling and validation
const FormField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad" | "numeric";
  placeholder?: string;
  maxLength?: number;
}> = ({
  label,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  placeholder,
  maxLength,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#ffffff66"
      maxLength={maxLength}
    />
    {error && <Text style={styles.fieldError}>{error}</Text>}
  </View>
);

// Update the PersonalDetails component to pass errors from props
interface PersonalDetailsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Record<string, string>;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const genderOptions = ["Male", "Female", "Other"];

  return (
    <View>
      <Text style={styles.subtitle}>Personal Details</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Gender</Text>
        <CustomPicker
          label="Select Gender"
          options={genderOptions}
          selectedValue={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
        />
      </View>

      <FormField
        label="Age"
        value={formData.age}
        onChangeText={(text) => setFormData({ ...formData, age: text })}
        error={errors.age}
        keyboardType="numeric"
        maxLength={3}
        placeholder="Enter your age"
      />

      <FormField
        label="Height (cm)"
        value={formData.height}
        onChangeText={(text) => setFormData({ ...formData, height: text })}
        error={errors.height}
        keyboardType="numeric"
        maxLength={3}
        placeholder="Enter your height in cm"
      />

      <FormField
        label="Weight (kg)"
        value={formData.weight}
        onChangeText={(text) => setFormData({ ...formData, weight: text })}
        error={errors.weight}
        keyboardType="decimal-pad"
        maxLength={5}
        placeholder="Enter your weight in kg"
      />

      <FormField
        label="Occupation"
        value={formData.occupation}
        onChangeText={(text) => setFormData({ ...formData, occupation: text })}
        error={errors.occupation}
        placeholder="Enter your occupation"
      />
    </View>
  );
};

// HealthAndGoals Component
const HealthAndGoals: React.FC<StepComponentProps> = ({
  formData,
  setFormData,
}) => {
  const goalsList: string[] = [
    "Lose Weight",
    "Gain Weight",
    "Maintain Weight",
    "Boost Energy",
    "Improve Immunity",
    "Enhance Skin and Hair",
    "Build Lean Muscle",
    "Improve Stamina",
    "Prepare for Sports",
    "Manage Diabetes",
    "Control Blood Pressure",
    "Improve Digestion",
    "Gut Health",
    "Cardiac Health",
    "Cholesterol Management",
    "Festive Season Detox",
    "Pre-Wedding",
  ];
  const conditionsList: string[] = [
    "Diabetes",
    "Hypertension",
    "Respiratory",
    "Heart Condition",
    "High Cholesterol",
  ];
  const symptomsList: string[] = [
    "Unexplained Fatigue or Changes in Energy Levels",
    "Significant Changes in Weight or Appetite",
    "Recurring Headaches, Dizziness, or Difficulty Concentrating",
    "Digestive Issues",
    "Physical Changes",
    "Breathing Difficulties or Heart-Related Symptoms",
    "Persistent Muscle Weakness or Joint Discomfort",
    "Unusual Swelling or Coldness in Extremities",
    "Persistent Mood Changes or Sleep Disturbances",
    "Frequent Infections or Prolonged Illness Recovery Time",
  ];

  return (
    <View>
      <Text style={styles.title}>Health and Goals</Text>
      <Text style={{ color: Colors.mainBlue, fontSize: 16, marginBottom: 8 }}>
        Nutrition Goals (Select one or more)
      </Text>
      <MultiSelect
        options={goalsList}
        selected={formData.goals}
        onChange={(goals) => setFormData({ ...formData, goals })}
      />
      <Text>Health Conditions</Text>
      <MultiSelect
        options={conditionsList}
        selected={formData.healthConditions}
        onChange={(conditions) =>
          setFormData({ ...formData, healthConditions: conditions })
        }
      />
      <Text>Current Symptoms</Text>
      <MultiSelect
        options={symptomsList}
        selected={formData.symptoms}
        onChange={(symptoms) => setFormData({ ...formData, symptoms })}
        allowCustom
      />
    </View>
  );
};

// DietPreferences Component
const DietPreferences: React.FC<StepComponentProps> = ({
  formData,
  setFormData,
}) => {
  const allergiesList: string[] = [
    "Peanuts",
    "Milk",
    "Eggs",
    "Gluten",
    "Soy",
    "Tree Nuts",
    "Shellfish",
    "Legumes",
    "None",
  ];
  const habitsList: string[] = ["I smoke", "I drink alcohol", "None", "Other"];
  const dietStyles: string[] = [
    "Everything Goes",
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Keto",
    "Other",
  ];
  const spiceLevels: string[] = [
    "No Spice Please!",
    "Mild",
    "Medium",
    "Hot",
    "Dragon Breath",
  ];
  const textures: string[] = [
    "Crunchy",
    "Smooth",
    "Chewy",
    "Crispy",
    "No Preference",
  ];
  const avoidFoods: string[] = [
    "Quinoa",
    "Brown Rice",
    "Maida (Refined Flour)",
    "Bread",
    "Oats",
    "Tofu",
  ];

  return (
    <View>
      <Text style={styles.title}>Diet Preferences</Text>
      <Text style={styles.label}>Food Allergies</Text>
      <MultiSelect
        options={allergiesList}
        selected={formData.allergies}
        onChange={(allergies) => setFormData({ ...formData, allergies })}
        allowCustom
      />
      <Text style={styles.label}>Quick Habits Check</Text>
      <MultiSelect
        options={habitsList}
        selected={formData.habits}
        onChange={(habits) => setFormData({ ...formData, habits })}
      />
      <Text style={styles.label}>Primary Diet Style</Text>
      <CustomPicker
        options={dietStyles}
        selectedValue={formData.dietStyle}
        onValueChange={(value) =>
          setFormData({ ...formData, dietStyle: value })
        }
      />
      <Text style={styles.label}>Spice Tolerance</Text>
      <CustomPicker
        options={spiceLevels}
        selectedValue={formData.spiceLevel}
        onValueChange={(value) =>
          setFormData({ ...formData, spiceLevel: value })
        }
      />
      <Text style={styles.label}>Texture Preferences</Text>
      <MultiSelect
        options={textures}
        selected={formData.texturePreferences}
        onChange={(textures) =>
          setFormData({ ...formData, texturePreferences: textures })
        }
      />
      <Text style={styles.label}>Foods to Avoid</Text>
      <MultiSelect
        options={avoidFoods}
        selected={formData.foodsToAvoid}
        onChange={(foods) => setFormData({ ...formData, foodsToAvoid: foods })}
        allowCustom
      />
    </View>
  );
};

// Lifestyle Component
const Lifestyle: React.FC<StepComponentProps> = ({ formData, setFormData }) => {
  const cookingLevels: string[] = [
    "I don't cook",
    "Amateur Cook",
    "Home Chef",
    "Professional",
  ];
  const meals: string[] = ["Breakfast", "Lunch", "Dinner"];

  const updateMealTime = (
    meal: "breakfast" | "lunch" | "snack" | "dinner",
    time: string
  ) => {
    setFormData({
      ...formData,
      mealTimes: { ...formData.mealTimes, [meal]: time },
    });
  };

  return (
    <View>
      <Text style={styles.title}>Lifestyle</Text>
      <Text style={styles.label}>Cooking Level</Text>
      <CustomPicker
        options={cookingLevels}
        selectedValue={formData.cookingLevel}
        onValueChange={(value) =>
          setFormData({ ...formData, cookingLevel: value })
        }
      />
      <TimePicker
        label="Wake Up Time"
        value={formData.wakeUpTime}
        onChange={(time) => setFormData({ ...formData, wakeUpTime: time })}
      />
      <TimePicker
        label="Sleep Time"
        value={formData.sleepTime}
        onChange={(time) => setFormData({ ...formData, sleepTime: time })}
      />
      <Text style={styles.label}>Meal Times</Text>
      {(["breakfast", "lunch", "snack", "dinner"] as const).map((meal) => (
        <TimePicker
          key={meal}
          label={meal.charAt(0).toUpperCase() + meal.slice(1)}
          value={formData.mealTimes[meal]}
          onChange={(time) => updateMealTime(meal, time)}
        />
      ))}
      <Text style={styles.label}>Heaviest Meal of the Day</Text>
      <CustomPicker
        options={meals}
        selectedValue={formData.heaviestMeal}
        onValueChange={(value) =>
          setFormData({ ...formData, heaviestMeal: value })
        }
      />
    </View>
  );
};

// Activity Component
const Activity: React.FC<StepComponentProps> = ({ formData, setFormData }) => {
  const activityLevels: string[] = [
    "Couch Potato",
    "Light Exercise",
    "Regular Workouts",
    "Fitness Enthusiast",
    "Athletic Beast",
  ];
  const days: string[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const workoutTypes: string[] = [
    "Light Workouts",
    "Medium-Intensity Workouts",
    "High-Intensity Workouts",
  ];

  return (
    <View>
      <Text style={styles.title}>Activity</Text>
      <Text style={styles.label}>How active are you?</Text>
      <CustomPicker
        options={activityLevels}
        selectedValue={formData.activityLevel}
        onValueChange={(value) =>
          setFormData({ ...formData, activityLevel: value })
        }
      />
      <Text style={styles.label}>Do you work out?</Text>
      <Switch
        value={formData.workouts.doWorkouts}
        onValueChange={(value) =>
          setFormData({
            ...formData,
            workouts: { ...formData.workouts, doWorkouts: value },
          })
        }
        trackColor={{ false: "#767577", true: Colors.mainBlue }}
        thumbColor={formData.workouts.doWorkouts ? Colors.white : "#f4f3f4"}
      />
      {formData.workouts.doWorkouts && (
        <>
          <Text style={styles.label}>Workout Days</Text>
          <MultiSelect
            options={days}
            selected={formData.workouts.days}
            onChange={(days) =>
              setFormData({
                ...formData,
                workouts: { ...formData.workouts, days },
              })
            }
          />
          <TimePicker
            label="Workout Time"
            value={formData.workouts.time}
            onChange={(time) =>
              setFormData({
                ...formData,
                workouts: { ...formData.workouts, time },
              })
            }
          />
          <Text style={styles.label}>Workout Type</Text>
          <CustomPicker
            options={workoutTypes}
            selectedValue={formData.workouts.type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                workouts: { ...formData.workouts, type: value },
              })
            }
          />
          <Text style={styles.label}>Workout Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.workouts.duration}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                workouts: { ...formData.workouts, duration: text },
              })
            }
            keyboardType="numeric"
            placeholderTextColor="#ffffff66"
          />
        </>
      )}
    </View>
  );
};

// Cuisines Component
const Cuisines: React.FC<StepComponentProps> = ({ formData, setFormData }) => {
  //   const [location, setLocation] = useState<Location.LocationObject | null>(null);
  //   const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  //   const getCurrentLocation = async () => {
  //     setLoading(true);
  //     try {
  //       if (Platform.OS === 'android' && !Device.isDevice) {
  //         setErrorMsg('This will not work on an Android Emulator. Try it on your device!');
  //         return;
  //       }

  //       let { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== 'granted') {
  //         setErrorMsg('Permission to access location was denied');
  //         return;
  //       }

  //     //   const location = await Location.getCurrentPositionAsync({});
  //     //   setLocation(location);

  //       // Get the address from coordinates
  //     //   const [placemark] = await Location.reverseGeocodeAsync({
  //     //     latitude: location.coords.latitude,
  //     //     longitude: location.coords.longitude,
  //     //   });

  //       if (placemark) {
  //         const address = [
  //           placemark.name,
  //           placemark.street,
  //           placemark.city,
  //           placemark.region
  //         ].filter(Boolean).join(', ');

  //         setFormData(prev => ({ ...prev, location: address }));
  //       }
  //     } catch (error) {
  //       setErrorMsg('Error getting location');
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const homeCuisines: string[] = [
    "Punjabi, Mahja Style",
    "Tamil Nadu, Chettinad Style",
    "Kerala, Travancore Style",
    "Bengali, Kolkata Style",
    "Rajasthani, Marwari Style",
    "Maharashtra, Kolhapuri Style",
    "Karnataka, Udupi Style",
    "Goan, Konkan Style",
    "Kashmir, Wazwan Style",
    "Odisha, Odia Style",
  ];
  const otherCuisines: string[] = [
    "South Indian",
    "North Indian",
    "Indian",
    "Chinese",
    "Indo-Chinese",
    "Italian",
    "Mexican",
    "Korean",
    "Thai",
    "French",
    "American",
    "Mediterranean",
  ];

  return (
    <View>
      <Text style={styles.title}>Cuisines</Text>
      <Text style={styles.label}>Current Location</Text>
      <View style={styles.locationContainer}>
        <TextInput
          style={[styles.input, styles.locationInput]}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholderTextColor="#ffffff66"
          placeholder="Enter your location"
        />
        <TouchableOpacity
          style={[styles.locButton, loading && styles.disabledButton]}
          onPress={() => {}} //get location
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Ionicons
              name="navigate-circle-outline"
              size={28}
              color={Colors.mainBlue}
            />
          )}
        </TouchableOpacity>
      </View>
      {/* {errorMsg && (
        <Text style={styles.locationError}>{errorMsg}</Text>
      )} */}

      <Text style={styles.label}>Home Cuisine</Text>
      <CustomPicker
        options={homeCuisines}
        selectedValue={formData.homeCuisine}
        onValueChange={(value) =>
          setFormData({ ...formData, homeCuisine: value })
        }
      />
      <Text style={styles.label}>Other Cuisines You Like</Text>
      <MultiSelect
        options={otherCuisines}
        selected={formData.otherCuisines}
        onChange={(cuisines) =>
          setFormData({ ...formData, otherCuisines: cuisines })
        }
        allowCustom
      />
    </View>
  );
};

// Define the ConfirmationProps interface
interface ConfirmationProps extends StepComponentProps {
  onSubmit: (data: FormData) => void;
}

// Add helper functions
const getStepDescription = (step: number, isEdit = false): string => {
  const prefix = isEdit ? "Edit your " : "";
  switch (step) {
    case 0:
      return `${prefix}Profile Information`;
    case 1:
      return `${prefix}Personal Details`;
    case 2:
      return `${prefix}Health & Goals`;
    case 3:
      return `${prefix}Diet Preferences`;
    case 4:
      return `${prefix}Daily Routine`;
    case 5:
      return `${prefix}Activity Level`;
    case 6:
      return `${prefix}Location & Cuisine`;
    case 7:
      return isEdit ? "Save Profile Changes" : "Review & Confirm";
    default:
      return "";
  }
};

// Update the helper function to convert dates to timestamps
const convertDatesToTimestamps = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return data.getTime(); // Convert to Unix timestamp in milliseconds
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertDatesToTimestamps(item));
  }

  if (typeof data === "object") {
    const converted: { [key: string]: any } = {};
    for (const key in data) {
      converted[key] = convertDatesToTimestamps(data[key]);
    }
    return converted;
  }

  return data;
};

// Main Questionnaire Component
const Questionnaire: React.FC<{
  onComplete: (data: FormData) => void;
  isLoading?: boolean;
}> = ({ onComplete, isLoading = false }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    occupation: "",
    goals: [],
    healthConditions: [],
    symptoms: [],
    allergies: [],
    habits: [],
    dietStyle: "",
    spiceLevel: "",
    texturePreferences: [],
    foodsToAvoid: [],
    cookingLevel: "",
    wakeUpTime: null,
    sleepTime: null,
    mealTimes: { breakfast: null, lunch: null, snack: null, dinner: null },
    heaviestMeal: "",
    activityLevel: "",
    workouts: {
      doWorkouts: false,
      days: [],
      time: null,
      type: "",
      duration: "",
    },
    location: "",
    homeCuisine: "",
    otherCuisines: [],
    primaryGoal: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Get current user data for editing
  const currUser = useQuery(api.users.getCurrentUser);
  
  // Load existing user data when editing
  useEffect(() => {
    if (currUser) {
      // Prefill name and profile details
      if (currUser.name) {
        setFormData(prev => ({
          ...prev,
          name: currUser.name || "",
        }));
      }
      
      if (currUser.profileDetails) {
        setFormData(prev => ({
          ...prev,
          profilePicture: currUser.profileDetails?.picture,
          height: currUser.profileDetails?.height ? String(currUser.profileDetails.height) : "",
          weight: currUser.profileDetails?.weight ? String(currUser.profileDetails.weight) : "",
        }));
      }
      
      // Prefill questionnaire data if it exists
      if (currUser.questionnaire) {
        const q = currUser.questionnaire;
        setFormData(prev => ({
          ...prev,
          gender: q.gender || "",
          age: q.age || "",
          occupation: q.occupation || "",
          goals: q.goals || [],
          healthConditions: q.healthConditions || [],
          symptoms: q.symptoms || [],
          allergies: q.allergies || [],
          habits: q.habits || [],
          dietStyle: q.dietStyle || "",
          spiceLevel: q.spiceLevel || "",
          texturePreferences: q.texturePreferences || [],
          foodsToAvoid: q.foodsToAvoid || [],
          cookingLevel: q.cookingLevel || "",
          wakeUpTime: q.wakeUpTime,
          sleepTime: q.sleepTime,
          mealTimes: q.mealTimes || { breakfast: null, lunch: null, snack: null, dinner: null },
          heaviestMeal: q.heaviestMeal || "",
          activityLevel: q.activityLevel || "",
          workouts: q.workouts || {
            doWorkouts: false,
            days: [],
            time: null,
            type: "",
            duration: "",
          },
          location: q.location || "",
          homeCuisine: q.homeCuisine || "",
          otherCuisines: q.otherCuisines || [],
          primaryGoal: q.primaryGoal || "",
        }));
      }
    }
  }, [currUser]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const shakeError = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStepChange = (step: number) => {
    if (step > currentStep) {
      const stepErrors = validateStep(currentStep);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        shakeError();
        return;
      }
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentStep(step);
    setErrors({});

    // Scroll to top when changing steps
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, 100);
  };

  const skipQuestionnaire = () => {
    // Create minimal required data
    const minimalData = {
      ...formData,
      name: formData.name || "User",
      gender: formData.gender || "Other",
      age: formData.age || "30",
      height: formData.height || "170",
      weight: formData.weight || "70",
      occupation: formData.occupation || "Not specified",
      goals: formData.goals.length ? formData.goals : ["Improve Health"],
      dietStyle: formData.dietStyle || "Everything Goes",
      spiceLevel: formData.spiceLevel || "Medium",
      cookingLevel: formData.cookingLevel || "Amateur Cook",
      heaviestMeal: formData.heaviestMeal || "Dinner",
      activityLevel: formData.activityLevel || "Light Exercise",
      location: formData.location || "Not specified",
      homeCuisine: formData.homeCuisine || "Indian",
      primaryGoal: "Improve Health",
      completedAt: new Date().toISOString(),
    };

    onComplete(minimalData);
  };

  const validateStep = (step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Profile Info
        if (!formData.name.trim()) {
          stepErrors.name = "Please enter your name";
        }
        break;

      case 1: // Personal Details
        const age = parseInt(formData.age as string, 10);
        if (!formData.age || isNaN(age) || age < 13) {
          stepErrors.age = "Please enter a valid age (13 or older)";
        }
        const height = parseInt(formData.height as string, 10);
        if (!formData.height || isNaN(height) || height < 100 || height > 250) {
          stepErrors.height = "Please enter a valid height (100-250 cm)";
        }
        const weight = parseFloat(formData.weight as string);
        if (!formData.weight || isNaN(weight) || weight < 30 || weight > 300) {
          stepErrors.weight = "Please enter a valid weight (30-300 kg)";
        }
        if (!formData.gender) {
          stepErrors.gender = "Please select your gender";
        }
        if (!formData.occupation || formData.occupation.trim().length < 2) {
          stepErrors.occupation = "Please enter your occupation";
        }
        break;

      case 2: // Health and Goals
        if (!formData.goals || formData.goals.length === 0) {
          stepErrors.goals = "Please select at least one goal";
        }
        break;

      case 3: // Diet Preferences
        if (!formData.dietStyle) {
          stepErrors.dietStyle = "Please select your diet style";
        }
        if (!formData.spiceLevel) {
          stepErrors.spiceLevel = "Please select your preferred spice level";
        }
        break;

      case 4: // Daily Routine
        if (!formData.cookingLevel) {
          stepErrors.cookingLevel =
            "Please select your cooking experience level";
        }
        if (!formData.wakeUpTime) {
          stepErrors.wakeUpTime = "Please select your wake-up time";
        }
        if (!formData.sleepTime) {
          stepErrors.sleepTime = "Please select your sleep time";
        }
        break;

      case 5: // Activity Level
        if (!formData.activityLevel) {
          stepErrors.activityLevel = "Please select your activity level";
        }
        break;

      case 6: // Location and Cuisine
        if (!formData.location || formData.location.trim().length < 2) {
          stepErrors.location = "Please enter your location";
        }
        if (!formData.homeCuisine) {
          stepErrors.homeCuisine = "Please select your home cuisine";
        }
        break;
    }

    return stepErrors;
  };

  const isFormValid = (): boolean => {
    // For the final confirmation step, we only need a primary goal
    if (currentStep === steps.length - 1) {
      return formData.primaryGoal !== "" || (formData.goals.length > 0 && formData.goals[0] !== "");
    }
    
    const errors = validateStep(currentStep);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    const finalErrors = validateStep(currentStep);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    const convertedData = {
      ...formData,
      completedAt: new Date().toISOString(),
    };
    onComplete(convertedData);
  };

  const steps: JSX.Element[] = [
    <ProfileInfo
      formData={formData}
      setFormData={setFormData}
      errors={errors}
    />,
    <PersonalDetails
      formData={formData}
      setFormData={setFormData}
      errors={errors}
    />,
    <HealthAndGoals formData={formData} setFormData={setFormData} />,
    <DietPreferences formData={formData} setFormData={setFormData} />,
    <Lifestyle formData={formData} setFormData={setFormData} />,
    <Activity formData={formData} setFormData={setFormData} />,
    <Cuisines formData={formData} setFormData={setFormData} />,
    <Confirmation
      formData={formData}
      setFormData={setFormData}
      onSubmit={onComplete}
    />,
  ];

  // Check if we're in edit mode
  const isEditMode = currUser?.questionnaire?.completedAt;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.mainBlue} />
        <Text style={styles.loadingText}>Saving your preferences...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      <SafeAreaView style={{ flex: 1, marginTop: 20 }}>
        <LinearGradient
          colors={["#1a1a1a", "#000000"]}
          style={styles.gradientContainer}
        >
          <View style={styles.container}>
            {/* Header with Back Button (Edit Mode) and Progress Bar */}
            <View style={styles.headerContainer}>
              {isEditMode && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => {
                    // Use router to navigate back to profile
                    if (typeof window !== 'undefined') {
                      // For Expo Router
                      const router = require('expo-router');
                      router.router.back();
                    }
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
              )}
              
              <View style={{
                width: '100%',
                height: 8,
                backgroundColor: "#222222",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 10,
              }}>
                <Animated.View
                  style={[
                    {
                      height: "100%",
                      backgroundColor: Colors.mainBlue,
                      borderRadius: 4,
                      shadowColor: Colors.mainBlue,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 3,
                      elevation: 5,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Step Indicator and Skip Button */}
            <View style={styles.stepIndicator}>
              <View>
              <Text style={styles.stepText}>
                Step {currentStep + 1} of {steps.length}
              </Text>
              <Text style={styles.stepDescription}>
                  {getStepDescription(currentStep, Boolean(isEditMode))}
              </Text>
              </View>
              {!isEditMode && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={skipQuestionnaire}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Form Content */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <Animated.View
                style={[
                  styles.stepContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                {steps[currentStep]}
              </Animated.View>

              {Object.keys(errors).length > 0 && (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateX: shakeAnim }],
                    },
                  ]}
                >
                  {Object.entries(errors).map(([field, message]) => (
                    <Text key={field} style={styles.errorText}>
                      {message}
                    </Text>
                  ))}
                </Animated.View>
              )}

              <View style={styles.navigation}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    style={[styles.navButton, styles.backButton]}
                    onPress={() => handleStepChange(currentStep - 1)}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={20}
                      color={Colors.white}
                    />
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
            
            {/* Next/Complete Button */}
            <View style={{ height: 50 }}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.nextButton,
                  (!isFormValid() || isLoading) && styles.disabledButton,
                ]}
                onPress={() =>
                  currentStep === steps.length - 1
                    ? handleSubmit()
                    : handleStepChange(currentStep + 1)
                }
                disabled={!isFormValid() || isLoading}
              >
                <Text style={styles.buttonText}>
                  {currentStep === steps.length - 1 ? "Complete" : "Next"}
                </Text>
                <Ionicons
                  name={
                    currentStep === steps.length - 1
                      ? "checkmark"
                      : "arrow-forward"
                  }
                  size={20}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
};

// Update the Confirmation Component
const Confirmation: React.FC<ConfirmationProps> = ({
  formData,
  setFormData,
  onSubmit,
}) => {
  const currUser = useQuery(api.users.getCurrentUser);
  const isEditMode = Boolean(currUser?.questionnaire?.completedAt);
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    formData.primaryGoal || formData.goals[0] || ""
  );

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height) / 100;
    const bmi = weight / (height * height);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const handleSubmit = () => {
    const convertedData = {
      ...formData,
      primaryGoal,
      completedAt: new Date().toISOString(),
    };
    onSubmit(convertedData);
  };

  return (
    <View style={styles.confirmationContainer}>
      <View>
        <Text style={styles.sectionTitle}>
          {isEditMode ? "Update Your Primary Goal" : "Select Your Primary Goal"}
        </Text>
        <View style={styles.goalsList}>
          {formData.goals.length > 0 ? (
            formData.goals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  primaryGoal === goal && styles.goalOptionSelected,
                ]}
                onPress={() => setPrimaryGoal(goal)}
              >
                <Text
                  style={[
                    styles.goalText,
                    primaryGoal === goal && styles.goalTextSelected,
                  ]}
                >
                  {goal}
                </Text>
                {primaryGoal === goal && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.mainBlue}
                  />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.goalText}>No goals selected</Text>
          )}
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gender</Text>
            <Text style={styles.summaryValue}>{formData.gender}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Age</Text>
            <Text style={styles.summaryValue}>{formData.age} years</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Height</Text>
            <Text style={styles.summaryValue}>{formData.height} cm</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Weight</Text>
            <Text style={styles.summaryValue}>{formData.weight} kg</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>BMI</Text>
            <Text style={styles.summaryValue}>
              {calculateBMI()} ({getBMICategory(parseFloat(calculateBMI()))})
            </Text>
          </View>
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Diet & Health</Text>
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Diet Style</Text>
            <Text style={styles.summaryValue}>{formData.dietStyle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Spice Level</Text>
            <Text style={styles.summaryValue}>{formData.spiceLevel}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Activity Level</Text>
            <Text style={styles.summaryValue}>{formData.activityLevel}</Text>
          </View>
          {formData.healthConditions.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Health Conditions</Text>
              <Text style={[styles.summaryValue, { color: "#ff6b6b" }]}>
                {formData.healthConditions.join(", ")}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Location & Cuisine</Text>
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>{formData.location}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Home Cuisine</Text>
            <Text style={styles.summaryValue}>{formData.homeCuisine}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.approveButton} onPress={handleSubmit}>
        <Text style={styles.approveButtonText}>
          {isEditMode ? "Save Changes" : "Confirm & Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Add new image upload component
interface ProfileInfoProps extends StepComponentProps {
  errors: Record<string, string>;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const [bmi, setBmi] = useState<number | null>(null);
  const saveImage = useMutation(api.files.saveProfilePicture);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { user } = useClerkUser();
  const curruser = useQuery(api.users.getCurrentUser);
  const profilePicture =
    curruser?.profileDetails?.picture || formData.profilePicture;
  const imageUrl = useQuery(
    api.files.getImageUrl,
    profilePicture ? { storageId: profilePicture } : "skip"
  );
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    // Calculate BMI when height or weight changes
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBmi = weight / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(1))); // Round to 1 decimal place
    } else {
      setBmi(null);
    }
  }, [formData.height, formData.weight]);

  const handleSelectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      try {
        const postUrl = await generateUploadUrl();
        const fileData = await fetch(uri);
        if (!fileData.ok) {
          console.error("Error loading file from URI:", fileData);
          throw new Error("Failed to load image from URI");
        }
        const blob = await fileData.blob();
        const uploadResult = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });

        if (!uploadResult.ok) {
          throw new Error("Failed to upload image to Convex");
        }

        const { storageId } = await uploadResult.json();
        await saveImage({ picastorageId: storageId });
        setFormData({ ...formData, profilePicture: storageId });
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
      }
    }
  };

  return (
    <View>
      <Text style={styles.title}>Let's get to know you</Text>

      <View style={styles.profileImageContainer}>
        {imageUrl ? (
          <>
            {imageLoading && <ProfileImageSkeleton />}
            <FastImage
              source={{
                uri: imageUrl,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.profileImage}
              resizeMode={FastImage.resizeMode.cover}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          </>
        ) : (
          <View style={styles.emptyProfileContainer}>
            <UserVector width={50} height={50} />
          </View>
        )}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleSelectImage}
        >
          <Ionicons name="camera" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FormField
        label="Your Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter your full name"
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Gender</Text>
        <CustomPicker
          label="Select Gender"
          options={["Male", "Female", "Other"]}
          selectedValue={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
        />
      </View>

      <FormField
        label="Age"
        value={formData.age}
        onChangeText={(text) => setFormData({ ...formData, age: text })}
        error={errors.age}
        keyboardType="numeric"
        maxLength={3}
        placeholder="Enter your age"
      />

      <FormField
        label="Height (cm)"
        value={formData.height}
        onChangeText={(text) => setFormData({ ...formData, height: text })}
        error={errors.height}
        keyboardType="numeric"
        maxLength={3}
        placeholder="Enter your height in cm"
      />

      <FormField
        label="Weight (kg)"
        value={formData.weight}
        onChangeText={(text) => setFormData({ ...formData, weight: text })}
        error={errors.weight}
        keyboardType="decimal-pad"
        maxLength={5}
        placeholder="Enter your weight in kg"
      />

      {bmi !== null && (
        <View style={styles.bmiContainer}>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={styles.bmiValue}>{bmi}</Text>
        </View>
      )}

      <FormField
        label="Occupation"
        value={formData.occupation}
        onChangeText={(text) => setFormData({ ...formData, occupation: text })}
        error={errors.occupation}
        placeholder="Enter your occupation"
      />
    </View>
  );
};

// Profile image loading fallback
const ProfileImageSkeleton = () => (
  <View style={styles.emptyProfileContainer}>
    <MotiView
      from={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 1000,
        loop: true,
        repeatReverse: true,
      }}
      style={styles.profileSkeleton}
    />
    <ActivityIndicator
      size="small"
      color={Colors.mainBlue}
      style={styles.profileLoader}
    />
  </View>
);

export default Questionnaire;
