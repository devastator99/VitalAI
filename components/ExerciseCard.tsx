import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Colors from '~/utils/Colors';

interface ExerciseCardProps {
  title: string;
  image: string;
  duration: string;
  sets: number;
  reps: number;
  onPress: () => void;
  index: number;
}

export function ExerciseCard({ 
  title, 
  image, 
  duration, 
  sets, 
  reps, 
  onPress, 
  index 
}: ExerciseCardProps) {
  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: 50,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: 1,
      }}
      transition={{
        type: 'timing',
        duration: 500,
        delay: index * 100,
      }}>
      <Pressable
        onPress={onPress}
        style={styles.card}>
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{sets}</Text>
              <Text style={styles.detailLabel}>Sets</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{reps}</Text>
              <Text style={styles.detailLabel}>Reps</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{duration}</Text>
              <Text style={styles.detailLabel}>Duration</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgb(26, 26, 26)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(0, 99, 175)',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
});