import React, { useRef, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "~/utils/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// ProgressBar component with animation and gradient
const ProgressBar = ({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  // Create semi-transparent versions of the color
  const fadeColor = (color: string, opacity: number) => {
    return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  };

  return (
    <View
      style={{
        height: 10,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.31)",
        borderRadius: 5,
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          width: widthInterpolation,
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[
            color, // Full opacity
            fadeColor(color, 0.8), // 60% opacity
            fadeColor(color, 0.6), // 30% opacity
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: "100%",
            width: "100%",
          }}
        />
      </Animated.View>
    </View>
  );
};

// Main NutrientCard component
const NutrientCard = ({
  carbs,
  protein,
  fats,
  calories,
}: {
  carbs: number;
  protein: number;
  fats: number;
  calories: number;
}) => {
  const nutrients = [
    {
      label: "Carbs",
      value: carbs,
      unit: "g",
      goal: 10,
      color: "rgb(0, 0, 255)",
      icon: "fruit-grapes",
    }, // blue
    {
      label: "Protein",
      value: protein,
      unit: "g",
      goal: 30,
      color: "rgb(0, 255, 0)",
      icon: "rice",
    }, // green
    {
      label: "Fats",
      value: fats,
      unit: "g",
      goal: 30,
      color: "rgb(255, 0, 0)",
      icon: "weather-sunny",
    }, // red
    {
      label: "Calories",
      value: calories,
      unit: "kcal",
      goal: 10,
      color: "rgb(255, 165, 0)",
      icon: "fire",
    }, // orange
  ];

  return (
    <View
      style={{
        backgroundColor: "#121212",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        width: "100%",
      }}
    >
      {nutrients.map((nutrient, index) => {
        const percentage = Math.min(
          (nutrient.value / nutrient.goal) * 100,
          100
        );
        return (
          <View key={index} style={{ marginBottom: 15, gap: 10 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "space-between" }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <MaterialCommunityIcons
                name={nutrient.icon as any}
                size={20}
                color={nutrient.color}
              />
              <Text style={{ fontSize: 14, color: "white" }}>
                {` ${nutrient.label}`}
              </Text>
              </View>
              <Text style={{ fontSize: 10, color: "white" }}>
                {`${nutrient.value}${nutrient.unit} (${percentage.toFixed(1)}%)`}
              </Text>
            </View>
            <ProgressBar percentage={percentage} color={nutrient.color} />
          </View>
        );
      })}
    </View>
  );
};

export default NutrientCard;
