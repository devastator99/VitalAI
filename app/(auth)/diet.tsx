import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { WeekdaySelector } from "../../components/WeekdaySelector";
import { DietCard } from "../../components/DietCard";
import { ExerciseCard } from "../../components/ExerciseCard";
import MealDetails from "../../components/MealDetailsScreen";
import ExerciseDetails from "../../components/ExerciseDetails";
import Colors from "~/utils/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

type Section = "diet" | "exercise";

export default function Diet() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeSection, setActiveSection] = useState<Section>("diet");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const threeDayPlan = useQuery(api.plans.getThreeDayPlan);

  const handleMealPress = (mealId: string) => {
    setSelectedMealId(mealId);
  };

  const handleCloseMealDetails = () => {
    setSelectedMealId(null);
  };

  const handleExercisePress = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
  };

  const handleCloseExerciseDetails = () => {
    setSelectedExerciseId(null);
  };

  if (threeDayPlan === undefined) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Loading plan...</Text>
      </View>
    );
  }

  const selectedDayData = threeDayPlan[selectedDay];

  const mealsForDay = selectedDayData?.exists
    ? [
        ...(selectedDayData.meals?.breakfast?.map((m: any) => ({
          ...m,
          time: "Breakfast",
        })) || []),
        ...(selectedDayData.meals?.lunch?.map((m: any) => ({
          ...m,
          time: "Lunch",
        })) || []),
        ...(selectedDayData.meals?.dinner?.map((m: any) => ({
          ...m,
          time: "Dinner",
        })) || []),
        ...(selectedDayData.meals?.snacks?.map((m: any) => ({
          ...m,
          time: "Snack",
        })) || []),
      ]
    : [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Your Daily Plan",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerShadowVisible: false,
        }}
      />

      {selectedMealId ? (
        <MealDetails id={selectedMealId} onClose={handleCloseMealDetails} />
      ) : selectedExerciseId ? (
        <ExerciseDetails
          id={selectedExerciseId}
          onClose={handleCloseExerciseDetails}
        />
      ) : (
        <View style={{ flex: 1}}>
          <View style={{ marginVertical: 15}}>
          <WeekdaySelector
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          </View>

          <View style={styles.sectionSelector}>
            <Pressable
              style={[
                styles.sectionButton,
                activeSection === "diet" && styles.activeSectionButton,
              ]}
              onPress={() => setActiveSection("diet")}
            >
              <MaterialCommunityIcons
                name="food-fork-drink"
                size={20}
                color={
                  activeSection === "diet" ? Colors.mainBlue : Colors.white
                }
              />
              <Text
                style={[
                  styles.sectionButtonText,
                  activeSection === "diet" && styles.activeSectionButtonText,
                ]}
              >
                Diet Plan
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.sectionButton,
                activeSection === "exercise" && styles.activeSectionButton,
              ]}
              onPress={() => setActiveSection("exercise")}
            >
              <MaterialCommunityIcons
                name="dumbbell"
                size={20}
                color={
                  activeSection === "exercise" ? Colors.mainBlue : Colors.white
                }
              />
              <Text
                style={[
                  styles.sectionButtonText,
                  activeSection === "exercise" &&
                    styles.activeSectionButtonText,
                ]}
              >
                Exercise Plan
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeSection === "diet"
              ? mealsForDay.map((meal, index) => (
                  <DietCard
                    key={meal._id}
                    title={meal.name}
                    image={
                      meal.attachId
                        ? /* Add image URL logic if needed */ ""
                        : ""
                    }
                    calories={meal.calories}
                    time={meal.time}
                    onPress={() => handleMealPress(meal._id)}
                    index={index}
                  />
                ))
              : selectedDayData?.exercises?.map(
                  (exercise: any, index: number) => (
                    <ExerciseCard
                      key={exercise._id}
                      title={exercise.name}
                      image={
                        exercise.attachId
                          ? /* Add image URL logic if needed */ ""
                          : ""
                      }
                      duration={`${exercise.duration} min`}
                      sets={exercise.sets}
                      reps={exercise.reps}
                      onPress={() => handleExercisePress(exercise._id)}
                      index={index}
                    />
                  )
                )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  sectionSelector: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#1F1F1F",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  sectionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#2C2C2C",
    gap: 8,
  },
  activeSectionButton: {
    backgroundColor: "#3A3A3A",
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  activeSectionButtonText: {
    color: Colors.mainBlue,
  },
});
