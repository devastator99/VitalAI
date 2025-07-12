import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  useAnimatedStyle,
  interpolate
} from 'react-native-reanimated';

interface SkeletonPlaceholderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonPlaceholder({
  width = '100%',
  height = 200,
  borderRadius = 8,
  style,
}: SkeletonPlaceholderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0.3, 0.7]);
    return {
      opacity,
      backgroundColor: '#E1E9EE',
      borderRadius,
    };
  });

  return (
    <View style={[{ width, height, borderRadius }, style]}>
      <Animated.View style={[
        styles.skeleton, 
        { borderRadius },
        animatedStyle
      ]} />
    </View>
  );
}

export function SkeletonText({
  width = '100%',
  height = 16,
  style,
}: SkeletonPlaceholderProps) {
  return (
    <SkeletonPlaceholder
      width={width}
      height={height}
      borderRadius={8}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    flex: 1,
  },
});