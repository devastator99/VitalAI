import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import { useAppStore } from "~/store";
import { LinearGradient } from "expo-linear-gradient";

export type FilePreviewProps = {
  fileUri: string;
  attachId: string;
  fileType: "image" | "document";
  fileName?: string;
  onSend: (attachId: string) => void;
  onCancel: () => void;
};

const FilePreview: React.FC<FilePreviewProps> = ({
  fileUri,
  fileType,
  attachId,
  fileName,
  onSend,
  onCancel,
}) => {
  const { setPreviewFile } = useAppStore();

  // Shared value for header animation (0: collapsed, 1: fully expanded)
  const headerExpanded = useSharedValue(0);

  useEffect(() => {
    // Animate header into view on mount
    headerExpanded.value = withTiming(1, { duration: 400 });
  }, []);

  // Animated style for the header (fading in and increasing in height)
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const heightInterpolation = interpolate(
      headerExpanded.value,
      [0, 1],
      [0, 60],
      Extrapolation.CLAMP
    );
    return {
      height: heightInterpolation,
      opacity: headerExpanded.value,
    };
  });

  const handleSend = () => {
    onSend(attachId);
  };

  return (
    <View style={styles.container}>
      {/* Animated header with title and icons */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.mainBlue,"#00254d", Colors.PitchBlack]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>File Preview</Text>
          <View style={styles.headerActions}>
            {/* Action to send file */}
            <TouchableOpacity onPress={handleSend} style={styles.actionButton}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.deepSkyBlue}
              />
            </TouchableOpacity>
            {/* Action to cancel preview */}
            <TouchableOpacity
              onPress={() => {
                onCancel();
              }}
              style={styles.actionButton}
            >
              <Ionicons name="close-circle" size={24} color={Colors.lightRed} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Preview area */}
      <View style={styles.previewContainer}>
        {fileType === "image" ? (
          <Image
            source={{ uri: fileUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.documentContainer}>
            <FontAwesome5 name="file-alt" size={60} color={Colors.greyLight} />
            {fileName && <Text style={styles.fileName}>{fileName}</Text>}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.mainBlue,
    backgroundColor: Colors.PitchBlack,
    elevation: 3, // for Android shadow effect
    shadowColor: "#000", // iOS shadow effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    maxWidth: "93%",
    height: "89%",
    marginBottom: 300,
    marginTop: 10,
    marginHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "400",
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 10,
  },
  previewContainer: {
    padding: 15,
    backgroundColor: Colors.PitchBlack,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  documentContainer: {
    alignItems: "center",
  },
  fileName: {
    marginTop: 10,
    color: "rgb(100, 100, 100)",
    fontSize: 14,
  },
  gradientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    width: "100%",
  },
});

export default FilePreview;
