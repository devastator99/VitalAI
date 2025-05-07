import React, { useState, Suspense } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { WeekdaySelector } from "../../components/WeekdaySelector";
import { DietCard } from "../../components/DietCard";
import { ExerciseCard } from "../../components/ExerciseCard";
import MealDetailsScreen from "../../components/MealDetailsScreen";
import ExerciseDetails from "../../components/ExerciseDetails";
import Colors from "~/utils/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import IconCircle from "~/components/IconCircle";
import { Id } from "~/convex/_generated/dataModel";

type Section = "diet" | "exercise";

const LoadingIndicator = () => (
  <View style={[styles.container, styles.loadingContainer]}>
    <ActivityIndicator size="large" color={Colors.mainBlue} />
    <Text style={styles.loadingText}>Loading your meal plan...</Text>
  </View>
);

// Add EmptyState component before DietContent
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

interface ExerciseCardProps {
  id: Id<"exercises">;
  title: string;
  imageId?: Id<"_storage">;
  category: "strength" | "cardio" | "flexibility" | "balance";
  difficulty: "beginner" | "intermediate" | "advanced";
  muscleGroups: string[]; // Renamed from targetedMuscleGroups
  equipment: string[];
  sets?: number;
  reps?: number;
  duration?: number;
  durationUnit?: "seconds" | "minutes";
  onPress: () => void;
  index: number;
}

// Update DietContent to handle undefined threeDayPlan
const DietContent = ({ selectedDay, activeSection, onMealPress, onExercisePress }: {
  selectedDay: string;
  activeSection: Section;
  onMealPress: (id: string) => void;
  onExercisePress: (id: string) => void;
}) => {
  const threeDayPlan = useQuery(api.plans.getThreeDayPlan);
  
  if (!threeDayPlan) {
    return <LoadingIndicator />;
  }
  
  const selectedDayData = threeDayPlan.find(obj => obj.date === selectedDay);

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
      }))
    : [];

  return (
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
              title={meal.title}
              image={meal?.attachId ? meal?.attachId : null}
              calories={meal.calories}
              time={meal.time}
              onPress={() => onMealPress(meal._id)}
              index={index}
            />
          ))
        )
      ) : exercisesForDay.length === 0 ? (
        <EmptyState section="exercise" />
      ) : (
        <Suspense fallback={<LoadingIndicator />}>
          {exercisesForDay.map((exercise: any, index: number) => (
            <ExerciseCard
              key={`${exercise._id}-${index}`}
              title={exercise.title}
              imageId={exercise.attachId}
              category={exercise.category}
              difficulty={exercise.difficulty}
              targetedMuscleGroups={exercise.targetedMuscleGroups || []}
              equipment={exercise.equipment || []}
              sets={exercise.sets}
              reps={exercise.reps}
              duration={exercise.duration}
              durationUnit={exercise.durationUnit || 'minutes'}
              onPress={() => onExercisePress(exercise._id)}
              index={index}
            />
          ))}
        </Suspense>
      )}
    </ScrollView>
  );
};

export default function Diet() {
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeSection, setActiveSection] = useState<Section>("diet");
  const router = useRouter();

  const DEFAULT_IMAGE_URL="dddccdc";
 
  // const getMealImageUrl = useCallback((attachId:any) => {
  //   if (!attachId) return DEFAULT_IMAGE_URL;
    
  //   // Use the imageUrl query to fetch the URL
  //   const url = useQuery(api.files.getImageUrl, { storageId: attachId });
  //   console.log("attach id url : " , url);
  //   return url || DEFAULT_IMAGE_URL;
  // }, []);

  const handleMealPress = (mealId: string) => {
    router.push(`/(details)/meal?id=${mealId}`);
  };

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/(details)/exercise?id=${exerciseId}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '400' }}>Your Daily </Text>
              <Text style={{ color: Colors.mainBlue, fontSize: 20, fontWeight: '400' }}>Plans</Text>
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
          headerTintColor: Colors.white,
        }}
      />
      
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

      <Suspense fallback={<LoadingIndicator />}>
        <DietContent 
          selectedDay={selectedDay}
          activeSection={activeSection}
          onMealPress={handleMealPress}
          onExercisePress={handleExercisePress}
        />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  sectionSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    marginTop: 16,
    fontSize: 16,
  },
});
