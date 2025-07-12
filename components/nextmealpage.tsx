import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { InfoCard } from "~/components/InfoCard";
import { SkeletonPlaceholder } from "~/components/SkeletonPlaceholder";

export default function NextMealPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Next Meal</Text>
      <InfoCard
        imageUrl="https://example.com/image.jpg"
        title="Meal Title"
        subtitle="Meal Subtitle"
        loading={false}
      />
      <SkeletonPlaceholder />

      <Text style={styles.title}>Next Exercise</Text>
      <InfoCard
        imageUrl="https://example.com/image.jpg"
        title="Exercise Title"
        subtitle="Exercise Subtitle"
        loading={false}
      />
      <SkeletonPlaceholder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
