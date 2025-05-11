import React,{Fragment} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Pressable,
} from "react-native";
import * as ContextMenu from "zeego/context-menu";
import { Role } from "~/utils/Interfaces";
import Colors from "~/utils/Colors";
import { MiniProfile } from "./MiniProfile";
import BirdVector from "./BirdVector";
import LinearGradient from "react-native-linear-gradient";
import { api } from "~/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "~/convex/_generated/dataModel";
import UserVector from "./UserVector";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { FontAwesome5 } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiPressable } from "moti/interactions";
import Gallery from "react-native-awesome-gallery";
import { useMemo } from "react";
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image } from "expo-image";

type MessageBubbleProps = {
  content: string;
  role: Role;
  isCurrentUser?: boolean;
  profileImage?: string;
  userId: string;
  messageId: Id<"messages">;
  type: string;
  attachId?: string;
  isMediaLoading?: boolean;
  readBy: Id<"users">[];
  timestamp?: number;
  participants: { id: Id<"users">; role: string }[];
};

const MemoizedAvatarImage = React.memo(({ uri, style }: { uri: string; style: any }) => (
  <Image 
    source={{ uri }} 
    style={style}
  />
), (prevProps, nextProps) => prevProps.uri === nextProps.uri);

const SingleImage = ({ style, url }: { style: any; url: string }) => (
  <Gallery
    data={[url]}
    onIndexChange={(newIndex) => {
      console.log(newIndex);
    }}
  />
);

const ProfileDetails = ({
  imageurl,
  userName,
  userRole,
  email,
  phone,
  height,
  weight,
  isVisible,
  onClose,
}: {
  imageurl: string | null;
  userName?: string;
  userRole?: string;
  email?: string;
  phone?: string;
  height?: number;
  weight?: number;
  isVisible: boolean;
  onClose: () => void;
}) => {
  const [loading, setLoading] = React.useState(true);

  if (!isVisible) return null;

  const formatRole = (role?: string) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header with close button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Image and Basic Info */}
          <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
              {userRole === "ai" ? (
                <BirdVector width={80} height={80} />
              ) : imageurl ? (
                <View style={styles.imageContainer}>
                  <React.Suspense
                    fallback={
                      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size="large" color={Colors.mainBlue} />
                      </View>
                    }
                  >
                    <MemoizedAvatarImage
                      uri={imageurl}
                      style={styles.profileImage}
                    />
                  </React.Suspense>
                </View>
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <UserVector height={40} width={40} />
                </View>
              )}
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.userName}>{userName || "Anonymous"}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{formatRole(userRole)}</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.infoSection}>
            {email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={Colors.mainBlue} />
                <Text style={styles.infoText}>{email}</Text>
              </View>
            )}
            {phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={Colors.mainBlue} />
                <Text style={styles.infoText}>{phone}</Text>
              </View>
            )}
          </View>

          {/* Physical Details - Only show if not a doctor or dietician */}
          {userRole !== "doctor" && userRole !== "dietician" && (height || weight) && (
            <View style={styles.physicalDetailsSection}>
              <Text style={styles.sectionTitle}>Physical Details</Text>
              <View style={styles.physicalDetailsGrid}>
                {height && (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Height</Text>
                    <Text style={styles.detailValue}>{height} cm</Text>
                  </View>
                )}
                {weight && (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Weight</Text>
                    <Text style={styles.detailValue}>{weight} kg</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const ReadReceipt = React.memo(
  ({
    isRead,
    readLabel,
    timestamp,
  }: {
    isRead: boolean;
    readLabel: string;
    timestamp?: number;
  }) => {
    const formattedTime = timestamp
      ? new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View style={styles.receiptContainer}>
        <View style={styles.receiptContent}>
          <Ionicons
            name={isRead ? "checkmark-done-sharp" : "checkmark-sharp"}
            size={15}
            color={isRead ? "#rgb(84, 187, 251)" : "#rgb(204, 204, 204)"}
            style={styles.receiptIcon}
          />
          {isRead && readLabel && (
            <Text style={styles.readText}>{readLabel}</Text>
          )}
        </View>
        {timestamp && <Text style={styles.timestampText}>{formattedTime}</Text>}
      </View>
    );
  }
);

const MessageBubble = React.memo(
  ({
    content,
    role,
    isCurrentUser,
    profileImage,
    userId,
    type,
    attachId,
    isMediaLoading,
    readBy,
    timestamp,
    participants,
    messageId,
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

    const senderUser = useQuery(api.users.getUserById, { id: userId as Id<"users"> });

    const handleAvatarPress = () => {
      setIsProfileVisible(true);
    };

    const handleProfileClose = () => {
      setIsProfileVisible(false);
    };

    const message = useQuery(api.messages.getMessageById, {
      messageId: messageId,
    });

    // Determine read receipt for messages sent by the current user
    const readLabel = React.useMemo(() => {
      if (!isCurrentUser) return null;

      const readers = readBy.filter((id) =>
        participants.some((p) => p.id === id && p.id !== message?.senderId)
      );

      // Create a set to hold unique role labels
      const roleLabels = new Set<string>();

      readers.forEach((id) => {
        const participant = participants.find((p) => p.id === id);
        if (participant) {
          switch (participant.role) {
            case "doctor":
              roleLabels.add("DR");
              break;
            case "dietician":
              roleLabels.add("DT");
              break;
            case "user":
              roleLabels.add("PT");
              break;
            default:
              break;
          }
        }
      });

      return Array.from(roleLabels).join(", ");
    }, [isCurrentUser, readBy, participants, message]);

    // Modify how isRead is calculated
    const isRead = isCurrentUser && !!readLabel && readLabel.length > 0;

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

    const formattedDateTime = React.useMemo(() => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }, [timestamp]);

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
                <MemoizedAvatarImage 
                  uri={imageUrl} 
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }
                  ]}
                >
                  <UserVector height={18} width={18} />
                </View>
              )}
            </TouchableOpacity>
          ))}

        <ProfileDetails
          isVisible={isProfileVisible}
          onClose={handleProfileClose}
          imageurl={imageUrl || null}
          userName={senderUser?.name}
          userRole={senderUser?.role}
          email={senderUser?.profileDetails?.email}
          phone={senderUser?.profileDetails?.phone}
          height={senderUser?.profileDetails?.height}
          weight={senderUser?.profileDetails?.weight}
        />

        {/* Content */}
        {content === "" && imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
        ) : (
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <Pressable onPress={() => {}}>
                {({ pressed }) => (
                  <Animated.View
                    style={[
                      styles.bubble,
                      isCurrentUser
                        ? styles.userBubble
                        : role === Role.Bot
                          ? styles.botBubble
                          : styles.humanBubble,
                      mediaUrl && styles.mediaBubble,
                      { transform: [{ scale: pressed ? 0.98 : 1 }] }
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
                    <View style={styles.messageFooter}>
                      {isCurrentUser && (
                        <ReadReceipt
                          isRead={isRead || false}
                          readLabel={readLabel || ""}
                          timestamp={timestamp}
                        />
                      )}
                      {!isCurrentUser && (
                        <Text style={styles.timeTooltip}>{formattedDateTime}</Text>
                      )}
                    </View>
                  </Animated.View>
                )}
              </Pressable>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item
                key="reply"
                onSelect={() => {
                  /* TODO: Implement reply */
                }}
              >
                <ContextMenu.ItemTitle>Reply</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{ name: "arrowshape.turn.up.left" }}
                />
              </ContextMenu.Item>
              <ContextMenu.Item
                key="forward"
                onSelect={() => {
                  /* TODO: Implement forward */
                }}
              >
                <ContextMenu.ItemTitle>Forward</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon ios={{ name: "paperplane" }} />
              </ContextMenu.Item>
              {isCurrentUser && (
                <ContextMenu.Item
                  key="delete"
                  destructive
                  onSelect={() => {
                    /* TODO: Implement delete */
                  }}
                >
                  <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon ios={{ name: "trash" }} />
                </ContextMenu.Item>
              )}
              {!isCurrentUser && (
                <ContextMenu.Item
                  key="view-profile"
                  onSelect={() => setIsProfileVisible(true)}
                >
                  <ContextMenu.ItemTitle>
                    View Sender Profile
                  </ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon ios={{ name: "person" }} />
                </ContextMenu.Item>
              )}
            </ContextMenu.Content>
          </ContextMenu.Root>
        )}
      </View>
    );
  }
);

// Extracted and memoized media components
const MediaComponent = React.memo(
  ({
    mediaUrl,
    isMediaLoading,
  }: {
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
          onPress={() =>
            SingleImage({ style: StyleSheet.absoluteFill, url: mediaUrl! })
          }
        >
          <Image
            source={{ uri: mediaUrl || "skip" }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    </View>
  )
);

const FileComponent = React.memo(({ mediaUrl }: { mediaUrl: string }) => (
  <TouchableOpacity
    onPress={async () => {
      try {
        const fileUri = `${FileSystem.cacheDirectory}${mediaUrl.split("/").pop()}`;
        await FileSystem.copyAsync({
          from: mediaUrl,
          to: fileUri,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf", // or get the correct mime type
          dialogTitle: "Open File",
        });
      } catch (error) {
        console.error("Failed to open file:", error);
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
    overflow: 'hidden',
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "90%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
    maxWidth: "100%",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 5,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderColor: Colors.mainBlue,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  nameSection: {
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.mainBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  infoSection: {
    marginTop: 24,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    color: "white",
    fontSize: 16,
  },
  physicalDetailsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  physicalDetailsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  detailBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  detailLabel: {
    color: Colors.mainBlue,
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  media: {
    width: 240,
    height: 240,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  mediaBubble: {
    padding: 0,
    overflow: "hidden",
  },
  fileContainer: {
    borderRadius: 20,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 8,
  },
  fileText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingIndicator: {
    flex: 1,
  },
  receiptContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginLeft: 0,
  },
  receiptContent: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  receiptIcon: { marginRight: 4 },
  readText: { color: Colors.deepSkyBlue, fontSize: 10, marginRight: 4 },
  timestampText: { color: "rgb(230, 230, 229)", fontSize: 12 },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  messageFooter: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  timeTooltip: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
});

export default React.memo(MessageBubble);
