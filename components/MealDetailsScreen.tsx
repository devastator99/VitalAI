import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  TouchableOpacity,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { ContextMenuSeparator } from "~/components/context-menu";
import Colors from "~/utils/Colors";
import { api } from "~/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "~/convex/_generated/dataModel";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import NutrientCard from "./NutrientCard";
import IconCircle from "~/components/IconCircle";

const AnimatedImage = Animated.Image;
const AnimatedView = Animated.View;

interface MealDetailsProps {
  id: string;
  style?: StyleProp<ViewStyle>;
}

// New component to encapsulate animation logic
const AnimatedNutritionItem = ({
  itemKey,
  value,
  index,
}: {
  itemKey: string;
  value: number;
  index: number;
}) => {
  // These hooks are now stable within a single component instance
  const itemOpacity = useSharedValue(0);
  const itemScale = useSharedValue(0.8);

  useEffect(() => {
    itemOpacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 300 })
    );
    itemScale.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
  }, [index]);

  const itemStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ scale: itemScale.value }],
  }));

  return (
    <AnimatedView key={itemKey} style={[styles.nutritionItem, itemStyle]}>
      <Text style={styles.nutritionValue}>{value}</Text>
      <Text style={styles.nutritionLabel}>{itemKey}</Text>
    </AnimatedView>
  );
};

export default function MealDetails({ id, style }: MealDetailsProps) {
  const router = useRouter();
  const meal = useQuery(api.plans.getMealById, { mealId: id as Id<"meals"> });
  const defaultImageId = "kg2bwrayksc02bmjwark74y71x7eee6j";

  const imageId = meal?.attachId || defaultImageId;
  // Only query for image URL when we have a valid storage ID
  const imgurl = useQuery(
    api.files.getImageUrl,
    imageId ? { storageId: imageId as Id<"_storage"> } : "skip"
  );

  const isLoading = !meal || (imageId && !imgurl);

  // const meal = MEAL_DETAILS[id as keyof typeof MEAL_DETAILS];
  const fadeAnim = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  console.log("imgurl", imgurl);
  console.log(meal);
  console.log(id);
  console.log("MEAL_DETAILS");

  useEffect(() => {
    if (!isLoading) {
      fadeAnim.value = withTiming(1, { duration: 500 });
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      contentTranslateY.value = withDelay(
        200,
        withTiming(0, { duration: 500 })
      );
    }
  }, [isLoading]); // Reset animations when loading state changes

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // // Create arrays of animated values at the component level
  // const itemOpacities = Object.entries(meal?.nutritionFacts || {}).map(() => useSharedValue(0));
  // const itemScales = Object.entries(meal?.nutritionFacts || {}).map(() => useSharedValue(0.8));

  // // Single useEffect to handle all animations
  // useEffect(() => {
  //   Object.entries(meal?.nutritionFacts || {}).forEach((_, index) => {
  //     itemOpacities[index].value = withDelay(index * 100, withTiming(1, { duration: 300 }));
  //     itemScales[index].value = withDelay(index * 100, withTiming(1, { duration: 300 }));
  //   });
  // }, []);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.mainBlue} />
      </View>
    );
  }

  if (!meal) return null;

  const handleClose = () => {
    router.back();
  };

  return (
    <ScrollView style={[styles.container, style]}>
      <AnimatedImage
        source={{ uri: imgurl as string }}
        style={[styles.image, imageAnimatedStyle]}
      />

      <AnimatedView style={[styles.content, contentAnimatedStyle]}>
        <Text style={[styles.title, { marginBottom: 20,fontWeight:700 }]}>
          {meal.title.split(" ").slice(0, -1).join(" ")}{" "}
          <Text style={{ color: Colors.mainBlue }}>
            {meal.title.split(" ").slice(-1)}
          </Text>
        </Text>

        <View style={styles.nutritionGrid}>
          <NutrientCard
            carbs={meal.nutritionFacts.carbs}
            protein={meal.nutritionFacts.protein}
            fats={meal.nutritionFacts.fats}
            calories={meal.nutritionFacts.fiber}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.listItem}>
              • {ingredient}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {meal.description.map((instruction: any, index: any) => (
            <Text key={index} style={styles.listItem}>
              {index + 1}. {instruction}
            </Text>
          ))}
        </View>
      </AnimatedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -40,
    backgroundColor: "#121212",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 17,
    fontWeight: "400",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(48, 48, 48, 0.31)",
    padding: 5,
    borderRadius: 12,
    marginBottom: 24,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.mainBlue,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#A0A0A0",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.mainBlue,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    color: "#E0E0E0",
    marginBottom: 8,
    lineHeight: 24,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(30, 30, 30, 0.9)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 28,
    color: "#FFFFFF",
    lineHeight: 40,
    marginTop: -4,
  },
});
