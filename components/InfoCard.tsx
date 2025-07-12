import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { SkeletonPlaceholder, SkeletonText } from './SkeletonPlaceholder';

interface InfoCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  loading: boolean;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export function InfoCard({
  imageUrl,
  title,
  subtitle,
  loading,
  onPress,
  backgroundColor = '#FFFFFF',
  textColor = '#1F2937',
}: InfoCardProps) {
  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor }]}>
        <SkeletonPlaceholder width="100%" height={160} borderRadius={12} />
        <View style={styles.content}>
          <SkeletonText width="70%" height={20} style={styles.titleSkeleton} />
          <SkeletonText width="85%" height={16} style={styles.subtitleSkeleton} />
        </View>
      </View>
    );
  }

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <FastImage
        source={{ uri: imageUrl }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  subtitleSkeleton: {
    marginBottom: 4,
  },
});