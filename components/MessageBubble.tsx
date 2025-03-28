import React from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import { Role } from '~/utils/Interfaces';
import Colors from '~/constants/Colors';
import {MiniProfile} from './MiniProfile';
import BirdVector from './BirdVector';
import LinearGradient from 'react-native-linear-gradient';

type MessageBubbleProps = {
  content: string;
  role: Role;
  imageUrl?: string;
  isCurrentUser?: boolean;
  profileImage?: string;
  userName?: string;
};

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

const MessageBubble = ({ content, role, imageUrl, isCurrentUser, profileImage, userName }: MessageBubbleProps) => {
  const [isProfileVisible, setIsProfileVisible] = React.useState(false);

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
            <BirdVector width={30} height={30} />
          </TouchableOpacity>
        ) : (
          // Other users avatar
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
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
        <View style={[styles.bubble, isCurrentUser ? styles.userBubble : styles.botBubble]}>
          <Text style={isCurrentUser ? styles.userText : styles.botText}>{content}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderLeftWidth: 0.15,
    borderLeftColor: '#0ff', // Cyan neon color
    shadowColor: '#0ff', // Optional glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  botText: {
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
