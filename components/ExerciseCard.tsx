import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Colors from "~/utils/Colors";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ExerciseCardProps {
  title: string;
  attachId: string;
  duration: string;
  sets: number;
  reps: number;
  onPress: () => void;
  index: number;
}

const defaultImageId = "kg2eywbhh87nypgy9eqrw12qa57erkxp";

export function ExerciseCard({
  title,
  attachId,
  duration,
  sets,
  reps,
  onPress,
  index,
}: ExerciseCardProps) {
  const effectiveImageId = attachId || defaultImageId;
  const imgurl = useQuery(
    api.files.getImageUrl,
    effectiveImageId
      ? { storageId: effectiveImageId as Id<"_storage"> }
      : "skip"
  );
  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: 1,
      }}
      transition={{
        type: "timing",
        duration: 500,
        delay: index * 100,
      }}
    >
      <Pressable onPress={onPress} style={styles.card}>
        <Image source={{ uri: imgurl as string }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{sets}</Text>
              <Text style={styles.detailLabel}>Sets</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{reps}</Text>
              <Text style={styles.detailLabel}>Reps</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{duration}</Text>
              <Text style={styles.detailLabel}>Duration</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgb(26, 26, 26)",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 12,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: {
    alignItems: "center",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgb(0, 99, 175)",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
  },
});
