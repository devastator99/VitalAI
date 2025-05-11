import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { MotiView } from "moti";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface ExerciseCardProps {
  title: string;
  imageId?: Id<"_storage">;
  category: "strength" | "cardio" | "flexibility" | "balance";
  difficulty: "beginner" | "intermediate" | "advanced";
  targetedMuscleGroups: string[];
  equipment: string[];
  sets?: number;
  reps?: number;
  duration?: number;
  durationUnit?: "seconds" | "minutes";
  onPress: () => void;
  index: number;
}

const defaultImageId = "kg2eywbhh87nypgy9eqrw12qa57erkxp";

const Badge = ({ icon, label, backgroundColor }: { icon: string; label: string; backgroundColor: string }) => (
  <View style={[styles.badge, { backgroundColor }]}>
    <MaterialCommunityIcons name={icon as any} size={12} color="#fff" style={{ marginRight: 4 }} />
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const Detail = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
  <View style={styles.detail}>
    <MaterialCommunityIcons name={icon as any} size={20} color={Colors.mainBlue} />
    <View style={{ marginLeft: 6 }}>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  </View>
);

export function ExerciseCard({
  title,
  imageId,
  category,
  difficulty,
  targetedMuscleGroups,
  equipment,
  sets,
  reps,
  duration,
  durationUnit,
  onPress,
  index,
}: ExerciseCardProps) {
  const effectiveImageId = imageId || defaultImageId;
  const imgurl = useQuery(
    api.files.getImageUrl,
    effectiveImageId
      ? { storageId: effectiveImageId as Id<"_storage"> }
      : "skip"
  );

  // Map types to badge styles
  const categoryColors = {
    strength: "#FF6B6B",
    cardio: "#4ECDC4",
    flexibility: "#FFAD5A",
    balance: "#5568FE",
  };
  const difficultyIcons = {
    beginner: "star-outline",
    intermediate: "star-half",
    advanced: "star-shooting",
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "timing", duration: 400, delay: index * 80 }}
    >
      <Pressable onPress={onPress} style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imgurl || defaultImageId  }} style={styles.image} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.gradient}
          />
          <View style={styles.headerOverlay}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <View style={styles.badgeContainer}>
              <Badge
                icon={difficultyIcons[difficulty]}
                label={difficulty}
                backgroundColor={Colors.mainBlue}
              />
              <Badge
                icon="dumbbell"
                label={category}
                backgroundColor={categoryColors[category]}
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.detailsRow}>
            {sets != null && <Detail icon="repeat" value={`${sets}`} label="Sets" />}
            {reps != null && <Detail icon="weight-lifter" value={`${reps}`} label="Reps" />}
            {duration != null && durationUnit && (
              <Detail
                icon="timer"
                value={`${duration}${durationUnit === "seconds" ? "s" : "m"}`}
                label="Duration"
              />
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {targetedMuscleGroups.map((m, index) => (
              <View key={`muscle-${index}`} style={styles.chip}>
                <Text style={styles.chipText}>{m}</Text>
              </View>
            ))}
            {equipment.map((e, index) => (
              <View key={`equipment-${index}`} style={[styles.chip, { borderColor: Colors.mainBlue }]}>
                <Text style={[styles.chipText, { color: Colors.mainBlue }]}>{e}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  content: {
    padding: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValue: {
    color: Colors.mainBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  detailLabel: {
    color: "#A1A1A1",
    fontSize: 10,
    textTransform: "uppercase",
  },
  chipScroll: {
    flexDirection: "row",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});
