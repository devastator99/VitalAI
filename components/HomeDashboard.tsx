import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView , TouchableOpacity} from "react-native";
import { MotiView } from "moti";
import IconCircle from "./IconCircle";
import FastImage from "@d11/react-native-fast-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "~/utils/Colors";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import CachedImage from "./CachedImage";

//T

// Skeleton Loading Component
import { ViewStyle, DimensionValue } from "react-native";
import { useAppStore } from "~/store";

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

const SkeletonLoader = ({
  width = "100%",
  height = 160,
  borderRadius = 16,
}: SkeletonLoaderProps) => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{
      type: "timing",
      duration: 1000,
      loop: true,
    }}
    style={[
      {
        width,
        height,
        backgroundColor: "#2A2A2A",
        borderRadius,
      },
    ]}
  />
);

// Meal Card Component with Skeleton Loading
const MealCard = ({ meal, isLoading, onPress }: any) => {
  const defaultImageId = "kg2bwrayksc02bmjwark74y71x7eee6j";
  const effectiveImageId = meal?.image || defaultImageId;
  const imgurl = useQuery(
    api.files.getImageUrl,
    effectiveImageId && !isLoading
      ? { storageId: effectiveImageId as Id<"_storage"> }
      : "skip"
  );

  if (isLoading) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "timing", duration: 400, delay: 200 }}
        style={styles.mealCard}
      >
        <SkeletonLoader height={180} borderRadius={16} />
        <View style={styles.mealContent}>
          <SkeletonLoader width="80%" height={20} borderRadius={8} />
          <View style={styles.mealDetailsLoading}>
            <SkeletonLoader width="40%" height={16} borderRadius={6} />
            <SkeletonLoader width="30%" height={16} borderRadius={6} />
          </View>
        </View>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "timing", duration: 400, delay: 200 }}
      style={styles.mealCard}
    >
      <View style={styles.mealImageContainer}>
        {imgurl ? (
          <CachedImage
            source={imgurl}
            style={styles.mealImage}
            resizeMode={FastImage.resizeMode.cover}
            fallbackColor="rgba(20, 20, 20, 0.9)"
            loaderColor={Colors.mainBlue}
          />
        ) : (
          <View style={styles.mealImagePlaceholder} />
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={styles.mealGradient}
        />
        <View style={styles.mealBadge}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
          <Text style={styles.mealBadgeText}>{meal?.time || "12:30 PM"}</Text>
        </View>
      </View>
      <View style={styles.mealContent}>
        <Text style={styles.mealTitle}>
          {meal?.title?.split(" ").slice(0, -1).join(" ")}{" "}
          <Text style={styles.mealTitleBlue}>
            {meal?.title?.split(" ").slice(-1)}
          </Text>
        </Text>
        <View style={styles.mealDetails}>
          <View style={styles.mealCalories}>
            <MaterialCommunityIcons
              name="fire"
              size={16}
              color={Colors.mainBlue}
            />
            <Text style={styles.caloriesText}>
              <Text style={styles.caloriesNumber}>{meal?.calories || 520}</Text>{" "}
              kcal
            </Text>
          </View>
          <View style={styles.mealMacros}>
            <Text style={styles.macroText}>P: 25g</Text>
            <Text style={styles.macroText}>C: 45g</Text>
            <Text style={styles.macroText}>F: 18g</Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
};

// Exercise Card Component with Skeleton Loading
const ExerciseCard = ({ exercise, isLoading, onPress }: any) => {
  const defaultImageId = "kg2eywbhh87nypgy9eqrw12qa57erkxp";
  const effectiveImageId = exercise?.imageId || defaultImageId;
  const imgurl = useQuery(
    api.files.getImageUrl,
    effectiveImageId && !isLoading
      ? { storageId: effectiveImageId as Id<"_storage"> }
      : "skip"
  );

  if (isLoading) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "timing", duration: 400, delay: 400 }}
        style={styles.exerciseCard}
      >
        <SkeletonLoader height={140} borderRadius={12} />
        <View style={styles.exerciseContent}>
          <SkeletonLoader width="70%" height={18} borderRadius={8} />
          <View style={styles.exerciseDetailsLoading}>
            <SkeletonLoader width="30%" height={14} borderRadius={6} />
            <SkeletonLoader width="25%" height={14} borderRadius={6} />
            <SkeletonLoader width="35%" height={14} borderRadius={6} />
          </View>
        </View>
      </MotiView>
    );
  }

  const categoryColors = {
    strength: "#FF6B6B",
    cardio: "#4ECDC4",
    flexibility: "#FFAD5A",
    balance: "#5568FE",
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "timing", duration: 400, delay: 400 }}
      style={styles.exerciseCard}
    >
      <View style={styles.exerciseImageContainer}>
        {imgurl ? (
          <CachedImage
            source={imgurl}
            style={styles.exerciseImage}
            resizeMode={FastImage.resizeMode.cover}
            fallbackColor="#1A1A1A"
            loaderColor={Colors.mainBlue}
          />
        ) : (
          <View style={styles.exerciseImagePlaceholder} />
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.exerciseGradient}
        />
        <View style={styles.exerciseBadge}>
          <MaterialCommunityIcons name="dumbbell" size={12} color="#fff" />
          <Text style={styles.exerciseBadgeText}>
            {exercise?.category || "strength"}
          </Text>
        </View>
      </View>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseTitle}>
          {exercise?.title || "Push-ups"}
        </Text>
        <View style={styles.exerciseDetails}>
          <View style={styles.exerciseDetail}>
            <MaterialCommunityIcons
              name="repeat"
              size={16}
              color={Colors.mainBlue}
            />
            <Text style={styles.exerciseDetailText}>
              {exercise?.sets || 3} sets
            </Text>
          </View>
          <View style={styles.exerciseDetail}>
            <MaterialCommunityIcons
              name="weight-lifter"
              size={16}
              color={Colors.mainBlue}
            />
            <Text style={styles.exerciseDetailText}>
              {exercise?.reps || 15} reps
            </Text>
          </View>
          <View style={styles.exerciseDetail}>
            <MaterialCommunityIcons
              name="timer"
              size={16}
              color={Colors.mainBlue}
            />
            <Text style={styles.exerciseDetailText}>
              {exercise?.duration || 10}min
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
};

// Main Dashboard Component
export default function HomeDashboard({ userName = "John" }) {
  const [isLoadingMeal, setIsLoadingMeal] = useState(true);
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const setShowDashboard = useAppStore((state) => state.setShowDashboard);
  // Simulate loading states
  useEffect(() => {
    const mealTimer = setTimeout(() => setIsLoadingMeal(false), 2000);
    const exerciseTimer = setTimeout(() => setIsLoadingExercise(false), 2500);

    return () => {
      clearTimeout(mealTimer);
      clearTimeout(exerciseTimer);
    };
  }, []);

  // Mock data
  const nextMeal = {
    title: "Grilled Salmon Bowl",
    image: "kg2bwrayksc02bmjwark74y71x7eee6j",
    calories: 520,
    time: "12:30 PM",
  };

  const nextExercise = {
    title: "Upper Body Strength",
    imageId: "kg2eywbhh87nypgy9eqrw12qa57erkxp",
    category: "strength",
    sets: 3,
    reps: 15,
    duration: 45,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => setShowDashboard(false)}
            style={{ marginLeft: 16, paddingEnd: 10 }}
          >
            <IconCircle name="chevron-back-sharp" size={17} />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.userName}>{userName}</Text>!
          </Text>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="account-circle"
              size={32}
              color={Colors.mainBlue}
            />
          </View>
        </MotiView>

        {/* Next Meal Section */}
        <MotiView
          from={{ opacity: 0, translateX: -30 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={24}
              color={Colors.mainBlue}
            />
            <Text style={styles.sectionTitle}>Your Next Meal</Text>
          </View>
          <MealCard
            meal={nextMeal}
            isLoading={isLoadingMeal}
            onPress={() => console.log("Meal pressed")}
          />
        </MotiView>

        {/* Next Exercise Section */}
        <MotiView
          from={{ opacity: 0, translateX: 30 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={24}
              color={Colors.mainBlue}
            />
            <Text style={styles.sectionTitle}>Your Next Exercise</Text>
          </View>
          <ExerciseCard
            exercise={nextExercise}
            isLoading={isLoadingExercise}
            onPress={() => console.log("Exercise pressed")}
          />
        </MotiView>

        {/* Quick Stats */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 600 }}
          style={styles.quickStats}
        >
          <Text style={styles.quickStatsTitle}>Today's Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
              <Text style={styles.statValue}>1,240</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="walk" size={20} color="#4ECDC4" />
              <Text style={styles.statValue}>8,532</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="water" size={20} color="#5568FE" />
              <Text style={styles.statValue}>2.1L</Text>
              <Text style={styles.statLabel}>Water</Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "300",
    color: "#fff",
  },
  userName: {
    color: Colors.mainBlue,
    fontWeight: "600",
  },
  headerIcon: {
    padding: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },

  // Meal Card Styles
  mealCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mealImageContainer: {
    position: "relative",
    height: 180,
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  mealImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(20, 20, 20, 0.9)",
  },
  mealGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  mealBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  mealContent: {
    padding: 16,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#fff",
    marginBottom: 12,
  },
  mealTitleBlue: {
    color: Colors.mainBlue,
    fontWeight: "600",
  },
  mealDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealCalories: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 6,
  },
  caloriesNumber: {
    color: Colors.mainBlue,
    fontWeight: "600",
  },
  mealMacros: {
    flexDirection: "row",
  },
  macroText: {
    color: "#A1A1A1",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 8,
  },
  mealDetailsLoading: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  // Exercise Card Styles
  exerciseCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exerciseImageContainer: {
    position: "relative",
    height: 140,
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  exerciseImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
  },
  exerciseGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  exerciseBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.mainBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "600",
    textTransform: "capitalize",
    marginLeft: 4,
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseDetailText: {
    color: "#A1A1A1",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  exerciseDetailsLoading: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  // Quick Stats
  quickStats: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
    marginTop: 16,
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.mainBlue,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: "#A1A1A1",
    marginTop: 4,
    fontWeight: "500",
  },
});
