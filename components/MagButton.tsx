import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { MotiText, MotiView } from 'moti';
import { memo } from 'react';

const MagButton = ({
  onPress = () => {},
  containerStyle = {},
  buttonStyle = {},
  children
}: {
  buttonColor?: string;
  onPress?: () => void;
  containerStyle?: object;
  buttonStyle?: object;
  children?: React.ReactNode;
}) => {
  const offset = useSharedValue({ x: 0, y: 0 });
  const isPressed = useSharedValue(false);
  const scale = useSharedValue(1);

  // Dampening factor (adjust for different magnetic strength)
  const DAMPENING = 0.4;
  
  // Spring configuration
  const SPRING_CONFIG = {
    mass: 0.8,
    damping: 15,
    stiffness: 200,
  };

  // Gesture handler for magnetic effect
  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
      scale.value = withTiming(0.95, { duration: 100 });
    })
    .onChange((e) => {
      // Apply magnetic pull with dampening
      offset.value = {
        x: e.translationX * DAMPENING,
        y: e.translationY * DAMPENING,
      };
    })
    .onFinalize(() => {
      isPressed.value = false;
      scale.value = withSpring(1, SPRING_CONFIG);
      // Snap back to original position
      offset.value = withSpring({ x: 0, y: 0 }, SPRING_CONFIG);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.container]}>
      <GestureDetector gesture={gesture}>
        <MotiView style={[animatedStyle, containerStyle]}>
          <Pressable
            onPress={() => onPress()}
            style={[styles.pressable, buttonStyle]}
          >
            {children}
          </Pressable>
        </MotiView>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    // Add any default styles for the Pressable component here
  }
});

export default memo(MagButton);