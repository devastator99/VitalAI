import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '~/utils/Colors';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

const { width } = Dimensions.get('window');

interface ExerciseDetailsProps {
  id: string;
}

// Animation Variant for Staggered Animation
const variants = {
  hidden: { opacity: 0, translateY: 20 },
  visible: (i: number) => ({
    opacity: 1,
    translateY: 0,
    transition: { delay: i * 0.15, type: 'timing' },
  }),
};

// Badge component for displaying metadata
const Badge = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.badge}>
    <MaterialCommunityIcons name={icon as any} size={16} color={Colors.mainBlue} />
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

export default function ExerciseDetails({ id }: ExerciseDetailsProps) {
  const exercise = useQuery(api.plans.getExerciseById, { exerciseId: id as Id<"exercises"> });
  const defaultImage = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800';
  
  // Get image URL if attachId exists
  const imageId = exercise?.attachId;
  const imgUrl = useQuery(
    api.files.getImageUrl,
    imageId ? { storageId: imageId as Id<"_storage"> } : "skip"
  );
  
  // Show loading state
  if (!exercise) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.mainBlue} />
      </View>
    );
  }
  
  // Map difficulty to visual indicators
  const difficultyIndicator = {
    beginner: { color: '#4CAF50', icon: 'signal-cellular-1', label: 'Beginner' },
    intermediate: { color: '#FFC107', icon: 'signal-cellular-2', label: 'Intermediate' },
    advanced: { color: '#F44336', icon: 'signal-cellular-3', label: 'Advanced' },
  };
  
  // Map category to icons
  const categoryIcon = {
    strength: 'weight-lifter',
    cardio: 'run',
    flexibility: 'human-handsup',
    balance: 'yoga',
  };
  
  // Get the correct difficulty data
  const difficultyData = difficultyIndicator[exercise.difficulty];
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imgUrl || defaultImage }}
          style={styles.headerImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {/* Title and Badges Overlay */}
        <View style={styles.headerContent}>
          <Text style={styles.title}>{exercise.title}</Text>
          
          <View style={styles.badgeRow}>
            <Badge 
              icon={categoryIcon[exercise.category]} 
              label={exercise.category} 
            />
            <Badge 
              icon={difficultyData.icon} 
              label={difficultyData.label} 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center'}}>
            {exercise.sets && (
              <MotiView
                key="sets-card"
                from={variants.hidden}
                animate={variants.visible(0)}
                style={styles.statCard}
              >
                <MaterialCommunityIcons name="repeat" size={24} color={Colors.mainBlue} />
                <Text style={styles.statValue}>{exercise.sets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </MotiView>
            )}
            
            {exercise.reps && (
              <MotiView
                key="reps-card"
                from={variants.hidden}
                animate={variants.visible(1)}
                style={styles.statCard}
              >
                <MaterialCommunityIcons name="arm-flex" size={24} color={Colors.mainBlue} />
                <Text style={styles.statValue}>{exercise.reps}</Text>
                <Text style={styles.statLabel}>Reps</Text>
              </MotiView>
            )}
            
            {exercise.duration && (
              <MotiView
                key="duration-card"
                from={variants.hidden}
                animate={variants.visible(2)}
                style={styles.statCard}
              >
                <MaterialCommunityIcons name="timer-outline" size={24} color={Colors.mainBlue} />
                <Text style={styles.statValue}>{exercise.duration}</Text>
                <Text style={styles.statLabel}>{exercise.durationUnit || 'min'}</Text>
              </MotiView>
            )}
            
            {exercise.restPeriod && (
              <MotiView
                key="rest-card"
                from={variants.hidden}
                animate={variants.visible(3)}
                style={styles.statCard}
              >
                <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.mainBlue} />
                <Text style={styles.statValue}>{exercise.restPeriod}</Text>
                <Text style={styles.statLabel}>Rest (sec)</Text>
              </MotiView>
            )}
          </View>
        </View>
        
        {/* Instructions */}
        {exercise.description && (
          <MotiView
            key="instructions-section"
            from={variants.hidden}
            animate={variants.visible(4)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={20} color={Colors.mainBlue} />
              <Text style={styles.sectionTitle}>Instructions</Text>
            </View>
            <Text style={styles.descriptionText}>{exercise.description}</Text>
          </MotiView>
        )}
        
        {/* Muscle Groups */}
        {exercise.targetedMuscleGroups && exercise.targetedMuscleGroups.length > 0 && (
          <MotiView
            key="muscles-section"
            from={variants.hidden}
            animate={variants.visible(5)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="human-male" size={20} color={Colors.mainBlue} />
              <Text style={styles.sectionTitle}>Targeted Muscles</Text>
            </View>
            <View style={styles.tagContainer}>
              {exercise.targetedMuscleGroups.map((muscle: string, index: number) => (
                <MotiView
                  key={`muscle-${index}-${muscle}`}
                  style={styles.tag}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, type: 'timing' }}
                >
                  <Text style={styles.tagText}>{muscle}</Text>
                </MotiView>
              ))}
            </View>
          </MotiView>
        )}
        
        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <MotiView
            key="equipment-section"
            from={variants.hidden}
            animate={variants.visible(6)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="dumbbell" size={20} color={Colors.mainBlue} />
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
            </View>
            <View style={styles.tagContainer}>
              {exercise.equipment.map((item: string, index: number) => (
                <MotiView
                  key={`equipment-${index}-${item}`}
                  style={[styles.tag, styles.equipmentTag]}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, type: 'timing' }}
                >
                  <Text style={styles.equipmentTagText}>{item}</Text>
                </MotiView>
              ))}
            </View>
          </MotiView>
        )}
        
        {/* Video Preview */}
        {exercise.videoUrl && (
          <MotiView
            key="video-section"
            from={variants.hidden}
            animate={variants.visible(7)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="video-outline" size={20} color={Colors.mainBlue} />
              <Text style={styles.sectionTitle}>Video Demonstration</Text>
            </View>
            <View style={styles.videoPlaceholder}>
              <MaterialCommunityIcons name="play-circle" size={48} color={Colors.white} />
              <Text style={styles.videoText}>Tap to watch demo</Text>
            </View>
          </MotiView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mainBlue,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  statCard: {
    width: (width - 64) / 2.3,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  descriptionText: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(67, 83, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(67, 83, 255, 0.3)',
  },
  tagText: {
    color: Colors.mainBlue,
    fontSize: 13,
    fontWeight: '500',
  },
  equipmentTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#404040',
  },
  equipmentTagText: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '500',
  },
  videoPlaceholder: {
    height: 180,
    backgroundColor: '#101010',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: Colors.white,
    marginTop: 10,
    fontSize: 14,
  }
});