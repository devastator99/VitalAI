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
import { useCallback } from "react";

type Section = "diet" | "exercise";

export default function Diet() {
  const [selectedDay, setSelectedDay] = useState<any>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeSection, setActiveSection] = useState<Section>("diet");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const threeDayPlan = useQuery(api.plans.getThreeDayPlan);
  

  const DEFAULT_IMAGE_URL="dddccdc";
 
  // const getMealImageUrl = useCallback((attachId:any) => {
  //   if (!attachId) return DEFAULT_IMAGE_URL;
    
  //   // Use the imageUrl query to fetch the URL
  //   const url = useQuery(api.files.getImageUrl, { storageId: attachId });
  //   console.log("attach id url : " , url);
  //   return url || DEFAULT_IMAGE_URL;
  // }, []);

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

  

  // const selectedDayData = threeDayPlan?.[selectedDay];
  const selectedDayData = threeDayPlan.find(obj => obj.date === selectedDay);
  console.log("selectedDayData: ",selectedDay)
  console.log("threedayplan: ",threeDayPlan)
  console.log("yo",selectedDayData)

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

  const exercisesForDay = selectedDayData?.exists && selectedDayData?.exercises
    ? selectedDayData.exercises.map((exercise: any) => ({
        ...exercise,
        // You can add any additional properties here if needed
        // For example, if you want to add a time property, you can do so
        // time: "Some Time", // Adjust this based on your data structure
      }))
    : [];

  const EmptyState = ({ section }: { section: Section }) => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name={section === 'diet' ? 'food-off' : 'weight-lifter'}
        size={64}
        color={Colors.mainBlue}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>
        No {section} plan for this day
      </Text>
      <Text style={styles.emptyText}>
        {section === 'diet' 
          ? 'Your nutrition plan will appear here once assigned'
          : 'Your exercise routine will show up here when created'}
      </Text>
    </View>
  );

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
        <View style={{ flex: 1 }}>
          <View style={{ marginVertical: 15 }}>
            <WeekdaySelector
              selectedDate={selectedDay}
              onSelectDate={setSelectedDay}
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
            contentContainerStyle={[
              styles.scrollContent,
              (mealsForDay.length === 0 || exercisesForDay.length === 0) && styles.centerContent
            ]}
            showsVerticalScrollIndicator={false}
          >
            {activeSection === "diet" ? (
              mealsForDay.length === 0 ? (
                <EmptyState section="diet" />
              ) : (
                mealsForDay.map((meal, index) => (
                  <DietCard
                    key={`${meal._id}-${index}`}
                    title={meal.name}
                    image={meal?.attachId ? meal?.attachId : null}
                    calories={meal.calories}
                    time={meal.time}
                    onPress={() => handleMealPress(meal._id)}
                    index={index}
                  />
                ))
              )
            ) : exercisesForDay.length === 0 ? (
              <EmptyState section="exercise" />
            ) : (
              exercisesForDay.map((exercise: any, index: number) => (
                <ExerciseCard
                  key={`${exercise._id}-${index}`}
                  title={exercise.name}
                  attachId={exercise.attachId}
                  duration={`${exercise.duration} min`}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  onPress={() => handleExercisePress(exercise._id)}
                  index={index}
                />
              ))
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 300,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.white,
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  centerContent: {
    justifyContent: 'center',
  },
});
