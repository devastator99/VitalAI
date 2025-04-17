import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MotiView, MotiImage } from 'moti';
import * as ContextMenu from 'zeego/context-menu';

const EXERCISE_DETAILS = {
  '1': {
    title: 'Morning Cardio',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800',
    duration: '30 min',
    sets: 3,
    reps: 15,
    equipment: [
      'Running shoes',
      'Comfortable clothes',
      'Water bottle',
    ],
    instructions: [
      'Start with a 5-minute warm-up walk',
      'Alternate between 2 minutes of jogging and 1 minute of walking',
      'Gradually increase jogging intervals',
      'Cool down with a 5-minute walk',
      'Stretch major muscle groups',
    ],
    targetMuscles: [
      'Quadriceps',
      'Hamstrings',
      'Calves',
      'Core',
      'Cardiovascular system',
    ],
    tips: [
      'Maintain proper posture',
      'Stay hydrated',
      'Listen to your body',
      'Breathe rhythmically',
    ],
  },
  '2': {
    title: 'Core Strength',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    duration: '20 min',
    sets: 4,
    reps: 12,
    equipment: [
      'Yoga mat',
      'Timer',
      'Resistance band (optional)',
    ],
    instructions: [
      'Begin with 30 seconds of plank hold',
      'Perform crunches with proper form',
      'Do Russian twists with controlled movement',
      'Hold side planks for 30 seconds each',
      'Finish with bicycle crunches',
    ],
    targetMuscles: [
      'Rectus Abdominis',
      'Obliques',
      'Transverse Abdominis',
      'Lower Back',
    ],
    tips: [
      'Keep your core engaged throughout',
      'Focus on quality over speed',
      'Breathe steadily',
      'Maintain proper form',
    ],
  },
  '3': {
    title: 'Evening Yoga',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    duration: '25 min',
    sets: 1,
    reps: 10,
    equipment: [
      'Yoga mat',
      'Yoga blocks (optional)',
      'Comfortable clothing',
    ],
    instructions: [
      'Start in child\'s pose for deep breathing',
      'Flow through sun salutations',
      'Hold warrior poses',
      'Practice balance poses',
      'End with savasana',
    ],
    targetMuscles: [
      'Full Body',
      'Core',
      'Hip Flexors',
      'Shoulders',
      'Back',
    ],
    tips: [
      'Focus on your breath',
      'Move mindfully',
      'Listen to your body',
      'Modify poses as needed',
    ],
  },
};

interface ExerciseDetailsScreenProps {
  id: string;
  onClose: () => void;
}

export default function ExerciseDetailsScreen({ id, onClose }: ExerciseDetailsScreenProps) {
  const exercise = EXERCISE_DETAILS[id as keyof typeof EXERCISE_DETAILS];

  if (!exercise) return null;

  const handleCopyImageUrl = () => {
    Alert.alert('Image URL Copied (Simulated)', exercise.image);
  };

  return (
    <ScrollView style={styles.container}>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <MotiImage
            source={{ uri: exercise.image }}
            style={styles.image}
            from={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              type: 'timing',
              duration: 500,
            }}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item key="copy" onSelect={handleCopyImageUrl}>
            <ContextMenu.ItemTitle>Copy Image URL</ContextMenu.ItemTitle>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item key="cancel" destructive>
            <ContextMenu.ItemTitle>Cancel</ContextMenu.ItemTitle>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>

      <MotiView
        style={styles.content}
        from={{
          opacity: 0,
          translateY: 50,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        transition={{
          type: 'timing',
          duration: 500,
          delay: 200,
        }}>
        <Text style={styles.title}>{exercise.title}</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercise.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercise.sets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercise.reps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Needed</Text>
          {exercise.equipment.map((item, index) => (
            <Text key={index} style={styles.listItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exercise.instructions.map((instruction, index) => (
            <Text key={index} style={styles.listItem}>
              {index + 1}. {instruction}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Muscles</Text>
          <View style={styles.muscleGrid}>
            {exercise.targetMuscles.map((muscle, index) => (
              <MotiView
                key={index}
                style={styles.muscleTag}
                from={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  type: 'timing',
                  duration: 300,
                  delay: index * 100,
                }}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </MotiView>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          {exercise.tips.map((tip, index) => (
            <Text key={index} style={styles.listItem}>• {tip}</Text>
          ))}
        </View>
      </MotiView>

      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -40,
    backgroundColor: '#121212',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2DD4BF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2DD4BF',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 8,
    lineHeight: 24,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  muscleText: {
    color: '#2DD4BF',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF3D00',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});