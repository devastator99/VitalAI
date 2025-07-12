import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Target, 
  Calendar, 
  User, 
  MessageCircle,
  Clock,
  Dumbbell,
  Utensils
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MealData {
  title: string;
  imageUri: string;
  time?: string;
}

interface ExerciseData {
  title: string;
  imageUri: string;
  reps?: string;
}

interface NextSessionPageProps {
  meal?: MealData;
  exercise?: ExerciseData;
  onNavigate: (screenName: 'HabitTracker' | 'Plans' | 'Profile' | 'Chat') => void;
}

const NextSessionPage: React.FC<NextSessionPageProps> = ({
  meal = {
    title: 'Grilled Salmon Bowl',
    imageUri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    time: 'in 2 hours'
  },
  exercise = {
    title: 'Upper Body Strength',
    imageUri: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800',
    reps: '3 sets × 12 reps'
  },
  onNavigate,
}) => {
  const [mealImageLoading, setMealImageLoading] = useState(true);
  const [exerciseImageLoading, setExerciseImageLoading] = useState(true);

  const handleNavigate = (screenName: 'HabitTracker' | 'Plans' | 'Profile' | 'Chat') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNavigate(screenName);
  };

  const navigationItems = [
    { 
      key: 'HabitTracker' as const, 
      icon: Target, 
      label: 'Habit Tracker',
      color: '#4CAF50'
    },
    { 
      key: 'Plans' as const, 
      icon: Calendar, 
      label: 'Plans',
      color: '#2196F3'
    },
    { 
      key: 'Profile' as const, 
      icon: User, 
      label: 'Profile',
      color: '#FF9800'
    },
    { 
      key: 'Chat' as const, 
      icon: MessageCircle, 
      label: 'Chat',
      color: '#9C27B0'
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
        style={styles.backdrop}
      />
      
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <View style={styles.contentCard}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.cardGradient}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleNavigate('HabitTracker')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)']}
                style={styles.closeButtonGradient}
              >
                <X size={20} color="#666" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Your Next Session</Text>
              <Text style={styles.headerSubtitle}>Stay on track with your goals</Text>
            </View>

            {/* Your Next Meal Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Utensils size={20} color="#4CAF50" />
                </View>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Your Next Meal</Text>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.timeText}>{meal.time}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.sectionSubtitle}>{meal.title}</Text>
              
              <View style={styles.imageContainer}>
                {mealImageLoading && (
                  <SkeletonPlaceholder
                    backgroundColor="#f0f0f0"
                    highlightColor="#e0e0e0"
                    speed={1200}
                  >
                    <View style={styles.imageSkeleton} />
                  </SkeletonPlaceholder>
                )}
                <FastImage
                  source={{ uri: meal.imageUri }}
                  style={[styles.image, mealImageLoading && styles.hiddenImage]}
                  resizeMode={FastImage.resizeMode.cover}
                  onLoadStart={() => setMealImageLoading(true)}
                  onLoadEnd={() => setMealImageLoading(false)}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
                  style={styles.imageOverlay}
                />
              </View>
            </View>

            {/* Your Next Exercise Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Dumbbell size={20} color="#2196F3" />
                </View>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Your Next Exercise</Text>
                  <Text style={styles.repsText}>{exercise.reps}</Text>
                </View>
              </View>
              
              <Text style={styles.sectionSubtitle}>{exercise.title}</Text>
              
              <View style={styles.imageContainer}>
                {exerciseImageLoading && (
                  <SkeletonPlaceholder
                    backgroundColor="#f0f0f0"
                    highlightColor="#e0e0e0"
                    speed={1200}
                  >
                    <View style={styles.imageSkeleton} />
                  </SkeletonPlaceholder>
                )}
                <FastImage
                  source={{ uri: exercise.imageUri }}
                  style={[styles.image, exerciseImageLoading && styles.hiddenImage]}
                  resizeMode={FastImage.resizeMode.cover}
                  onLoadStart={() => setExerciseImageLoading(true)}
                  onLoadEnd={() => setExerciseImageLoading(false)}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
                  style={styles.imageOverlay}
                />
              </View>
            </View>

            {/* Navigation Bar */}
            <View style={styles.navigationBar}>
              <LinearGradient
                colors={['rgba(248, 249, 250, 0.9)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.navGradient}
              >
                {navigationItems.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.navItem}
                    onPress={() => handleNavigate(item.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.navIconContainer, { backgroundColor: `${item.color}15` }]}>
                      <item.icon size={22} color={item.color} />
                    </View>
                    <Text style={[styles.navLabel, { color: item.color }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </LinearGradient>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  repsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 12,
  },
  imageContainer: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
  },
  imageSkeleton: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  navigationBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  navGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NextSessionPage;