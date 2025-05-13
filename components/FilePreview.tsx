import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Share, TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  runOnJS,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import { useAppStore } from "~/store";
import { LinearGradient } from "expo-linear-gradient";
import FastImage from "@d11/react-native-fast-image";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  // Get file extension and determine more specific file type
  const getFileDetails = () => {
    const extension = fileUri.split('.').pop()?.toLowerCase() || '';
    let icon = 'file-alt';
    let color = Colors.greyLight;
    
    // Determine file type by extension
    if (['pdf'].includes(extension)) {
      icon = 'file-pdf';
      color = '#FF5252';
    } else if (['doc', 'docx'].includes(extension)) {
      icon = 'file-word';
      color = '#4285F4';
    } else if (['xls', 'xlsx'].includes(extension)) {
      icon = 'file-excel';
      color = '#34A853';
    } else if (['ppt', 'pptx'].includes(extension)) {
      icon = 'file-powerpoint';
      color = '#EA4335';
    } else if (['zip', 'rar', '7z'].includes(extension)) {
      icon = 'file-archive';
      color = '#FFA000';
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      icon = 'file-audio';
      color = '#9C27B0';
    } else if (['mp4', 'mov', 'avi'].includes(extension)) {
      icon = 'file-video';
      color = '#E91E63';
    } else if (['txt', 'rtf'].includes(extension)) {
      icon = 'file-alt';
      color = '#757575';
    }
    
    return { icon, color, extension };
  };
  
  const fileDetails = getFileDetails();

  // Shared values for animations
  const headerExpanded = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Animate header into view on mount
    headerExpanded.value = withTiming(1, { duration: 400 });
  }, []);

  // Download the file to device
  const downloadFile = async () => {
    try {
      if (!mediaPermission?.granted) {
        const permission = await requestMediaPermission();
        if (!permission.granted) {
          return;
        }
      }

      setIsDownloading(true);
      
      const date = new Date();
      const localFileName = fileName || `file_${date.getTime()}.${fileDetails.extension}`;
      
      // Define download location
      const fileUri_local = `${FileSystem.documentDirectory}${localFileName}`;
      
      // Create a download callback to track progress
      const downloadResumable = FileSystem.createDownloadResumable(
        fileUri,
        fileUri_local,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );
      
      const downloadResult = await downloadResumable.downloadAsync();
      
      if (downloadResult && downloadResult.uri) {
        if (fileType === "image") {
          await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        } else {
          // For documents, we just save them to the documents directory
          // You could also use expo-sharing to share the file
          await Share.share({
            url: downloadResult.uri,
            title: localFileName,
          });
        }
      }
      
      setIsDownloading(false);
      setDownloadProgress(0);
      
    } catch (error) {
      console.log("Error downloading file:", error);
      setIsDownloading(false);
    }
  };

  // Handle gestures for zoom and pan
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      // Scale between 0.5 and 3
      scale.value = Math.min(Math.max(e.scale, 0.5), 3);
      // Hide controls during zoom
      if (showControls) runOnJS(setShowControls)(false);
    })
    .onEnd(() => {
      // Reset scale with spring animation when pinch ends
      scale.value = withSpring(1, { damping: 20 });
      // Show controls after zoom
      if (!showControls) runOnJS(setShowControls)(true);
    });
    
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow pan when zoomed in
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
        // Hide controls during pan
        if (showControls) runOnJS(setShowControls)(false);
      }
    })
    .onEnd(() => {
      // Reset position with spring animation
      translateX.value = withSpring(0, { damping: 20 });
      translateY.value = withSpring(0, { damping: 20 });
      // Show controls after pan
      if (!showControls) runOnJS(setShowControls)(true);
    });
    
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Toggle between zoom in and out on double tap
      if (scale.value !== 1) {
        scale.value = withSpring(1);
      } else {
        scale.value = withSpring(2);
      }
      // Toggle controls
      runOnJS(setShowControls)(!showControls);
    });
    
  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      // Toggle controls visibility
      runOnJS(setShowControls)(!showControls);
    });
    
  const combinedGestures = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTapGesture, singleTapGesture),
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  // Animated styles for interactive elements
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
  
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });
  
  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: showControls ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
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
          colors={[Colors.mainBlue, "#00254d", Colors.PitchBlack]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>
            {fileName || `File Preview ${fileDetails.extension ? `.${fileDetails.extension}` : ''}`}
          </Text>
          <Animated.View style={[styles.headerActions, controlsAnimatedStyle]}>
            {/* Action to download file */}
            <TouchableOpacity 
              onPress={downloadFile} 
              style={styles.actionButton}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color={Colors.mainBlue} />
              ) : (
                <Ionicons
                  name="download-outline"
                  size={24}
                  color={Colors.deepSkyBlue}
                />
              )}
            </TouchableOpacity>
            
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
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Preview area with gesture handling */}
      <GestureDetector gesture={combinedGestures}>
      <View style={styles.previewContainer}>
        {fileType === "image" ? (
            <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <FastImage
            source={{ uri: fileUri }}
            style={styles.previewImage}
            resizeMode={FastImage.resizeMode.contain}
          />
            </Animated.View>
        ) : (
          <View style={styles.documentContainer}>
              <FontAwesome5 
                name={fileDetails.icon} 
                size={70} 
                color={fileDetails.color} 
              />
            {fileName && <Text style={styles.fileName}>{fileName}</Text>}
              
              <View style={styles.fileInfo}>
                <Text style={styles.fileInfoText}>
                  {fileDetails.extension.toUpperCase()} File
                </Text>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={downloadFile}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <View style={styles.progressContainer}>
                      <ActivityIndicator size="small" color={Colors.white} />
                      <Text style={styles.progressText}>
                        {Math.round(downloadProgress * 100)}%
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.downloadText}>Download</Text>
                      <Ionicons name="download-outline" size={18} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
          </View>
        )}
      </View>
      </GestureDetector>
      
      {/* Help tip for gestures */}
      {fileType === "image" && showControls && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(300)}
          style={styles.tipContainer}
        >
          <BlurView intensity={20} tint="dark" style={styles.tipBlur}>
            <Text style={styles.tipText}>
              Pinch to zoom • Double tap to fit • Tap to hide controls
            </Text>
          </BlurView>
        </Animated.View>
      )}
      
      {/* Download progress overlay for images */}
      {isDownloading && fileType === "image" && (
        <View style={styles.downloadOverlay}>
          <BlurView intensity={50} tint="dark" style={styles.downloadBlur}>
            <ActivityIndicator size="large" color={Colors.mainBlue} />
            <Text style={styles.downloadingText}>
              Downloading... {Math.round(downloadProgress * 100)}%
            </Text>
          </BlurView>
        </View>
      )}
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
    flex: 1,
    marginRight: 10,
    ellipsizeMode: 'middle',
    numberOfLines: 1,
  } as TextStyle,
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  documentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(30, 30, 40, 0.3)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: "80%",
  },
  fileName: {
    marginTop: 20,
    marginBottom: 10,
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  } as TextStyle,
  fileInfo: {
    marginTop: 20,
    alignItems: "center",
  },
  fileInfoText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginBottom: 10,
  } as TextStyle,
  downloadButton: {
    backgroundColor: Colors.mainBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  downloadText: {
    color: Colors.white,
    fontWeight: "600",
    marginRight: 8,
  } as TextStyle,
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    color: Colors.white,
    marginLeft: 8,
  } as TextStyle,
  gradientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    width: "100%",
  },
  tipContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  tipBlur: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tipText: {
    color: Colors.white,
    fontSize: 12,
    textAlign: "center",
  } as TextStyle,
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  downloadBlur: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  downloadingText: {
    color: Colors.white,
    marginTop: 15,
    fontSize: 16,
  } as TextStyle,
});

export default FilePreview;
