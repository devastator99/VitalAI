// components/ScreenTransitionView.tsx
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  durationIn?: number;
  durationOut?: number;
  offsetY?: number; // Optional customization for slide offset
};

const ScreenTransitionView = ({
  children,
  style,
  durationIn = 300,
  durationOut = 200,
  offsetY = 200, // Default slide distance
}: Props) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(offsetY);

  useEffect(() => {
    // Animate in
    opacity.value = withTiming(1, { duration: durationIn });
    translateY.value = withTiming(0, { duration: durationIn });

    return () => {
      // Animate out
      opacity.value = withTiming(0, { duration: durationOut });
      translateY.value = withTiming(offsetY, { duration: durationOut });
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default ScreenTransitionView;
