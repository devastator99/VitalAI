import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { Role } from "~/utils/Interfaces";
import Colors from "~/utils/Colors";
import { MiniProfile } from "./MiniProfile";
import BirdVector from "./BirdVector";
import LinearGradient from "react-native-linear-gradient";
import { api } from "~/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "~/convex/_generated/dataModel";
import UserVector from "./UserVector";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { FontAwesome5 } from "@expo/vector-icons";
import {MotiPressable} from "moti/interactions";
import Gallery from "react-native-awesome-gallery";
type MessageBubbleProps = {
  content: string;
  role: Role;
  isCurrentUser?: boolean;
  profileImage?: string;
  userName?: string;
  type: string;
  attachId?: string;
  isMediaLoading?: boolean;
};

const MemoizedAvatarImage = React.memo(
  ({ uri, style }: { uri: string; style: any }) => (
    <Image source={{ uri }} style={style} />
  )
);

const SingleImage = ({ style,url }: { style: any,url:string }) => (
  <Gallery
    data={[url]}
    onIndexChange={(newIndex) => {
      console.log(newIndex);
    }}
  />
)

const ProfileDetails = ({
  profileImage,
  userName,
  isVisible,
  onClose,
}: {
  profileImage?: string;
  userName?: string;
  isVisible: boolean;
  onClose: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <MiniProfile />
      </TouchableOpacity>
    </Modal>
  );
};

const MessageBubble = React.memo(({
  content,
  role,
  isCurrentUser,
  profileImage,
  userName,
  type,
  attachId,
  isMediaLoading,
}: MessageBubbleProps) => {
  const [isProfileVisible, setIsProfileVisible] = React.useState(false);
  const imageUrl = useQuery(
    api.files.getImageUrl,
    profileImage ? { storageId: profileImage as Id<"_storage"> } : "skip"
  );
  const mediaUrl = useQuery(
    api.files.getImageUrl,
    attachId ? { storageId: attachId as Id<"_storage"> } : "skip"
  );

  const handleAvatarPress = () => {
    setIsProfileVisible(true);
  };

  const handleProfileClose = () => {
    setIsProfileVisible(false);
  };

  // Memoize media rendering
  const renderMedia = React.useCallback(() => {
    if (!mediaUrl && !isMediaLoading) return null;
    switch (type) {
      case "image":
        return (
          <MediaComponent  
            mediaUrl={mediaUrl ? mediaUrl : null}
            isMediaLoading={isMediaLoading}
          />
        );
      case "file":
        return mediaUrl ? (
          <FileComponent mediaUrl={mediaUrl} />
        ) : (
          <Text style={styles.fileText}>File not available</Text>
        );
      default:
        return null;
    }
  }, [type, mediaUrl, isMediaLoading]);

  return (
    <View style={[styles.row, isCurrentUser && styles.userRow]}>
      {/* Avatar - only show for non-current users */}
      {!isCurrentUser &&
        (role === Role.Bot ? (
          // AI Bot avatar
          //   <Image source={{ uri: profileImage }} style={styles.avatar} />
          <TouchableOpacity onPress={handleAvatarPress}>
            <BirdVector width={28} height={28} />
          </TouchableOpacity>
        ) : (
          // Other users avatar
          <TouchableOpacity onPress={handleAvatarPress}>
            {imageUrl ? (
              <MemoizedAvatarImage uri={imageUrl} style={styles.avatar} />
            ) : (
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                <UserVector height={18} width={18} />
              </View>
            )}
          </TouchableOpacity>
        ))}

      <ProfileDetails
        isVisible={isProfileVisible}
        onClose={handleProfileClose}
        profileImage={profileImage}
        userName={userName}
      />

      {/* Content */}
      {content === "" && imageUrl ? (
        <ContextMenu actions={[]} onPress={() => {}}>
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
        </ContextMenu>
      ) : (
        
        <View
          style={[
            styles.bubble,
            isCurrentUser
              ? styles.userBubble
              : role === Role.Bot
                ? styles.botBubble
                : styles.humanBubble,
            mediaUrl && styles.mediaBubble
          ]}
        >
          {renderMedia()}
          {type === "text" && (
            <Text
              style={
                isCurrentUser
                  ? styles.userText
                  : role === Role.Bot
                    ? styles.botText
                    : styles.humanText
              }
            >
              {content}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

// Extracted and memoized media components
const MediaComponent = React.memo(({ mediaUrl, isMediaLoading }: { 
  mediaUrl: string | null;
  isMediaLoading?: boolean;
}) => (
  <View style={styles.media}>
    {isMediaLoading ? (
      <ActivityIndicator 
        size="large" 
        color="rgb(0, 255, 255)" 
        style={styles.loadingIndicator}
      />
    ) : (
      <TouchableOpacity 
        style={StyleSheet.absoluteFill}
        onPress={() => SingleImage({ style: StyleSheet.absoluteFill, url: mediaUrl! })}
      >
        <Image 
          source={{ uri: mediaUrl || "skip" }} 
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </TouchableOpacity>
    )}
  </View>
));

const FileComponent = React.memo(({ mediaUrl }: { mediaUrl: string }) => (
  <TouchableOpacity 
    onPress={async () => {
      try {
        const fileUri = `${FileSystem.cacheDirectory}${mediaUrl.split('/').pop()}`;
        await FileSystem.copyAsync({
          from: mediaUrl,
          to: fileUri,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf', // or get the correct mime type
          dialogTitle: 'Open File',
        });
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }}
    style={styles.fileContainer}
  >
    <LinearGradient
      colors={[Colors.mainBlue, "#00254d", Colors.PitchBlack]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <FontAwesome5 name="file-alt" size={16} color="white" />
      <Text style={styles.fileText}>File Shared</Text>
    </LinearGradient>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    gap: 14,
    marginVertical: 12,
  },
  userRow: {
    flexDirection: "row-reverse",
  },
  item: {
    borderRadius: 15,
    overflow: "hidden",
  },
  btnImage: {
    margin: 6,
    width: 16,
    height: 16,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "transparent",
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "90%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
  },
  botBubble: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderLeftWidth: 0.15,
    borderLeftColor: "#0ff", // Cyan neon color
    shadowColor: "#0ff", // Optional glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, // Increased opacity for better visibility
    shadowRadius: 12, // Increased radius for a more pronounced shadow
  },
  humanBubble: {
    backgroundColor: "rgb(40, 40, 40)",
    maxWidth: "80%",
  },
  userText: {
    color: "white",
    fontSize: 16,
  },
  botText: {
    color: "white",
    fontSize: 16,
  },
  humanText: {
    color: "white",
    fontSize: 16,
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
  miniProfilePosition: {
    position: "absolute",
    top: 50, // Adjust this value based on your layout needs
    right: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  media: {
    width: 240,
    height: 240,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  mediaBubble: {
    padding: 0,
    overflow: 'hidden',
  },
  fileContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    // borderWidth: 2,
    // borderColor: Colors.mainBlue,
    backgroundColor: Colors.PitchBlack,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 8,
  },
  fileText: {
    color: "white",
    fontSize: 16,
    fontWeight: '500',
  },
  loadingIndicator: {
    flex: 1,
  },
});

export default React.memo(MessageBubble);
