import React from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import { Role } from '~/utils/Interfaces';
import Colors from '~/constants/Colors';
import {MiniProfile} from './MiniProfile';
import BirdVector from './BirdVector';
import LinearGradient from 'react-native-linear-gradient';
import { api } from '~/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '~/convex/_generated/dataModel';
import UserVector from './UserVector';

type MessageBubbleProps = {
  content: string;
  role: Role;
  isCurrentUser?: boolean;
  profileImage?: string;
  userName?: string;
};

const MemoizedAvatarImage = React.memo(({ uri, style }: { uri: string; style: any }) => (
  <Image source={{ uri }} style={style} />
));

const ProfileDetails = ({ profileImage, userName, isVisible, onClose }: { profileImage?: string, userName?: string, isVisible: boolean, onClose: () => void }) => {
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

const MessageBubble = ({ content, role, isCurrentUser, profileImage, userName }: MessageBubbleProps) => {
  const [isProfileVisible, setIsProfileVisible] = React.useState(false);
  const imageUrl = useQuery(api.files.getImageUrl, 
    profileImage ? { storageId: profileImage as Id<"_storage"> } : "skip"
   );

  const handleAvatarPress = () => {
    setIsProfileVisible(true);
  };

  const handleProfileClose = () => {
    
    setIsProfileVisible(false);
  };

  return (
    <View style={[styles.row, isCurrentUser && styles.userRow]}>
      {/* Avatar - only show for non-current users */}
      {!isCurrentUser && (
        role === Role.Bot ? (
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
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }}>
                <UserVector height={18} width={18} />
              </View>
            )}
          </TouchableOpacity>
        )
      )}

      <ProfileDetails
        isVisible={isProfileVisible}
        onClose={handleProfileClose}
        profileImage={profileImage}
        userName={userName}
      />

      {/* Content */}
      {content === '' && imageUrl ? (
        <ContextMenu
          actions={[]}
          onPress={() => {}}
        >
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
        </ContextMenu>
      ) : (
        <View style={[styles.bubble, isCurrentUser ? styles.userBubble : role === Role.Bot ? styles.botBubble : styles.humanBubble]}>
          <Text style={isCurrentUser ? styles.userText : role === Role.Bot ? styles.botText : styles.humanText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    gap: 14,
    marginVertical: 12,
  },
  userRow: {
    flexDirection: 'row-reverse',
  },
  item: {
    borderRadius: 15,
    overflow: 'hidden',
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
    backgroundColor: 'transparent',
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftWidth: 0.15,
    borderLeftColor: '#0ff', // Cyan neon color
    shadowColor: '#0ff', // Optional glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, // Increased opacity for better visibility
    shadowRadius: 12, // Increased radius for a more pronounced shadow
  },
  humanBubble: {
    backgroundColor: 'rgb(40, 40, 40)',
    maxWidth: '80%'
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  botText: {
    color: 'white',
    fontSize: 16,
  },
  humanText: {
    color: 'white',
    fontSize: 16,
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
  miniProfilePosition: {
    position: 'absolute',
    top: 50, // Adjust this value based on your layout needs
    right: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default MessageBubble;
