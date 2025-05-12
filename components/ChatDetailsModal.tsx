import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import CachedImage from './CachedImage';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import Colors from '~/utils/Colors';
import BirdVector from './BirdVector';
import UserVector from './UserVector';
import { useUser } from '~/store';

interface ChatDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  chatId: Id<'chats'>;
}

interface ParticipantItemProps {
  userId: Id<'users'>;
  role: string;
  isCurrentUser: boolean;
}

// Separate component for participant to handle individual image loading
const ParticipantItem = ({ userId, role, isCurrentUser }: ParticipantItemProps) => {
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // If this is the current user, use the data from state
  useEffect(() => {
    if (isCurrentUser && currentUser) {
      setUser(currentUser);
    }
  }, [isCurrentUser, currentUser]);
  
  // Otherwise, fetch user data from API
  const userData = useQuery(
    api.users.getUserById,
    isCurrentUser ? "skip" : { id: userId }
  );
  
  useEffect(() => {
    if (!isCurrentUser && userData) {
      setUser(userData);
    }
  }, [isCurrentUser, userData]);
  
  // Fetch profile picture if available
  const pictureId = user?.profileDetails?.picture;
  const pictureUrl = useQuery(
    api.files.getImageUrl,
    pictureId ? { storageId: pictureId } : "skip"
  );
  
  useEffect(() => {
    if (pictureUrl) {
      setProfilePicture(pictureUrl);
    }
  }, [pictureUrl]);
  
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  const bgColor = role.toLowerCase() === 'user' ? Colors.mainBlue : '#2a2a2a';
  
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          {role === 'ai' ? (
            <BirdVector width={24} height={24} />
          ) : profilePicture ? (
            <View style={styles.avatarImageContainer}>
              <CachedImage 
                source={profilePicture}
                style={styles.avatarImage}
                loaderColor={Colors.mainBlue}
                loaderSize="small"
              />
            </View>
          ) : (
            <UserVector height={18} width={18} />
          )}
        </View>
        <Text style={styles.nameText}>
          {user?.name ?? '...'}
          {isCurrentUser ? ' (You)' : ''}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    </View>
  );
};

const ChatDetailsModal: React.FC<ChatDetailsModalProps> = ({ 
  isVisible, 
  onClose, 
  chatId 
}) => {
  // Get current user from store
  const { user: currentUser } = useUser();
  
  // Get chat and participants
  const chat = useQuery(api.chats.getChatWithParticipants, { chatId });

  const fmtDate = React.useCallback((ts?: number) =>
    ts
      ? new Date(ts).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
    []
  );

  const renderItem = React.useCallback(({ item }: { item: any }) => {
    const isCurrentUser = item.id === currentUser?._id;
    return (
      <ParticipantItem 
        userId={item.id}
        role={item.role || 'user'} 
        isCurrentUser={isCurrentUser}
      />
    );
  }, [currentUser]);

  if (!chat) {
    return (
      <Modal transparent visible={isVisible} animationType="fade">
        <View style={styles.backdrop}>
          <ActivityIndicator size="large" color={Colors.mainBlue} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Heading */}
          <Text style={styles.heading}>
            <Text style={styles.chatText}>Chat</Text>
            <Text style={styles.partText}> Participants</Text>
          </Text>

          {/* Time */}
          <View style={styles.timeRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color="rgba(255,255,255,0.6)"
            />
            <Text style={styles.timeText}>{fmtDate(chat._creationTime)}</Text>
          </View>

          {/* Participants */}
          <FlatList
            data={chat.participants}
            inverted
            keyExtractor={(p) => p.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingBottom: 12 }}
          />

          {/* Close */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ChatDetailsModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chatText: {
    color: Colors.mainBlue,
  },
  partText: {
    color: 'white',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 8,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 16, 16, 0.11)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: 'black',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
});
