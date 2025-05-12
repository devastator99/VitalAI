import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";
import FastImage from "@d11/react-native-fast-image";
import Colors from "~/utils/Colors";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import CachedImage from "./CachedImage";

interface DietCardProps {
  title: string;
  image: string;
  calories: number;
  time: string;
  onPress: () => void;
  index: number;
}

const defaultImageId = "kg2bwrayksc02bmjwark74y71x7eee6j";

export function DietCard({
  title,
  image,
  calories,
  time,
  onPress,
  index,
}: DietCardProps) {
  const effectiveImageId = image || defaultImageId;
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
        <View style={styles.imageContainer}>
          {imgurl ? (
            <CachedImage
              source={imgurl}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              fallbackColor="rgba(20, 20, 20, 0.9)"
              loaderColor={Colors.mainBlue}
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <Text style={styles.titleBlue}>{title.split(" ").slice(-1)}</Text>
          </Text>
          <View style={styles.details}>
            <Text style={styles.calories}>
              <Text style={styles.kcal}>{calories}</Text> kcal
            </Text>
            <Text style={styles.time}>{time}</Text>
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
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "400",
    color: "white",
    marginBottom: 8,
  },
  titleBlue: {
    color: Colors.mainBlue,
    fontWeight: "600",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calories: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: "400",
  },
  kcal: {
    fontSize: 14,
    color: Colors.mainBlue,
    fontWeight: "500",
  },
  time: {
    fontSize: 14,
    color: "#D1D5DB",
  }
});
