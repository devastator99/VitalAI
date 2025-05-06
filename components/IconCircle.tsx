import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconCircleProps = {
  name: string; // Ionicon name
  size?: number; // Icon size
  diameter?: number; // Circle diameter
  bgColor?: string; // Background color
  iconColor?: string; // Icon color
  circleColor?: string; // Circle border color
};

const IconCircle: React.FC<IconCircleProps> = ({
  name,
  size = 16,
  diameter = 30,
  bgColor = "transparent",
  iconColor = "white", // Default icon color
  circleColor = "#539DF3", // Default circle color
}) => {
  return (
    <View
      style={[
        styles.circle,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderWidth:0.5,
          borderColor: circleColor, // Use circleColor prop
          backgroundColor: bgColor,
        },
      ]}
    >
      <Ionicons 
        name={name as keyof typeof Ionicons.glyphMap} 
        size={size} 
        color={iconColor} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default IconCircle;
