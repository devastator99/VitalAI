import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Share,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import ImagePreview from './ImagePreview';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

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

  // Download the file to device
  const downloadFile = async () => {
    try {
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

  const handleSend = () => {
    onSend(attachId);
  };

  return (
    <Modal
      visible={true}
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        {/* Header with title and icons */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="middle">
            {fileName || `File Preview ${fileDetails.extension ? `.${fileDetails.extension}` : ''}`}
          </Text>
          <View style={styles.headerActions}>
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
          </View>
        </View>

        {/* Preview area */}
        {fileType === "image" ? (
          <ImagePreview 
            uri={fileUri} 
            onClose={onCancel} 
          />
        ) : (
          <View style={styles.documentCard}>
  <View style={styles.docIconWrap}>
    <FontAwesome5 
      name={fileDetails.icon} 
      size={54} 
      color={fileDetails.color} 
    />
  </View>
  {fileName && (
    <Text style={styles.docFileName} numberOfLines={2} ellipsizeMode="middle">
      {fileName}
    </Text>
  )}
  <Text style={styles.docFileType}>
    {fileDetails.extension.toUpperCase()} File
  </Text>
  <TouchableOpacity 
    style={styles.downloadModernButton}
    onPress={downloadFile}
    disabled={isDownloading}
    activeOpacity={0.8}
  >
    {isDownloading ? (
      <View style={styles.progressContainer}>
        <ActivityIndicator size="small" color={Colors.white} />
        <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
      </View>
    ) : (
      <>
        <Ionicons name="download-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.downloadModernText}>Download</Text>
      </>
    )}
  </TouchableOpacity>
</View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  documentCard: {
    backgroundColor: 'rgba(32, 34, 41, 0.98)',
    borderRadius: 22,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    marginHorizontal: 24,
    marginTop: 48,
    marginBottom: 48,
    minWidth: 280,
    maxWidth: 400,
    alignSelf: 'center',
  },
  docIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docFileName: {
    color: Colors.white,
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 9,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  docFileType: {
    color: 'rgba(180,200,255,0.72)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 26,
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  downloadModernButton: {
    backgroundColor: Colors.mainBlue,
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 38,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
    minWidth: 160,
    justifyContent: 'center',
  },
  downloadModernText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginRight: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 15,
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  documentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(20, 20, 30, 0.5)",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  fileName: {
    marginTop: 25,
    marginBottom: 15,
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  fileInfo: {
    marginTop: 20,
    alignItems: "center",
  },
  fileInfoText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "500",
  },
  downloadButton: {
    backgroundColor: Colors.mainBlue,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  downloadText: {
    color: Colors.white,
    fontWeight: "600",
    marginRight: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    color: Colors.white,
    marginLeft: 10,
    fontWeight: "500",
  },
});

export default FilePreview;
