import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Colors from '~/utils/Colors';
import { useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

interface DietCardProps {
  title: string;
  image: string;
  calories: number;
  time: string;
  onPress: () => void;
  index: number;
}

const defaultImageId = 'kg2bwrayksc02bmjwark74y71x7eee6j';

export function DietCard({ title, image, calories, time, onPress, index }: DietCardProps) {

  const effectiveImageId = image || defaultImageId;
  const imgurl = useQuery(api.files.getImageUrl, 
    effectiveImageId ? { storageId: effectiveImageId as Id<"_storage"> } : 'skip');


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
          source={{ uri: imgurl as string}}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.details}>
            <Text style={styles.calories}>{calories} kcal</Text>
            <Text style={styles.time}>{time}</Text>
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calories: {
    fontSize: 14,
    color: Colors.mainBlue,
    fontWeight: '500',
  },
  time: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});