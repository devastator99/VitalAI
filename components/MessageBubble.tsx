import React from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import { Role } from '~/utils/Interfaces';
import Colors from '~/constants/Colors';

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
        <View style={styles.profileModal}>
          {profileImage && <Image source={{ uri: profileImage }} style={styles.modalAvatar} />}
          <Text style={styles.modalUserName}>{userName}</Text>
        </View>
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
            <Image source={require('~/assets/images/fk.png')} style={styles.avatar} />
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
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: 'rgba(0,0,0,0.4)', //E5E5EA
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  profileModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MessageBubble;
