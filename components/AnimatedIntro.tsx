import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  interpolateColor,
  Easing,
  runOnJS,
  interpolate,
  SharedValue,
  withRepeat,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import BirdVector from "~/components/BirdVector";
import Colors from "~/utils/Colors";
import BottomLoginSheet from "~/components/BottomLoginSheet";

const { width, height } = Dimensions.get("window");

const AnimatedIntro = () => {
  // Animation values
  const birdScale = useSharedValue(0);
  const birdRotation = useSharedValue(0);
  const birdY = useSharedValue(-100);
  const birdOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const bubbleScale1 = useSharedValue(0);
  const bubbleScale2 = useSharedValue(0);
  const bubbleY1 = useSharedValue(0);
  const bubbleY2 = useSharedValue(0);
  const backgroundColorAnim = useSharedValue(0);
  const loginSheetVisible = useSharedValue(0);

  // Start animations sequence
  useEffect(() => {
    // Bird entrance animation
    birdY.value = withDelay(
      500,
      withSpring(height * 0.35, {
        damping: 12,
        stiffness: 60,
      })
    );
    
    birdOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800 })
    );
    
    birdScale.value = withDelay(
      600,
      withSpring(1, { damping: 10 })
    );
    
    // Gentle bird floating animation
    birdRotation.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // infinite repetitions
      false
    );
    
    // Animated bubbles
    bubbleScale1.value = withDelay(
      1000,
      withTiming(1, { duration: 800 })
    );
    
    bubbleScale2.value = withDelay(
      1400,
      withTiming(1, { duration: 800 })
    );
    
    // Text fade in
    textOpacity.value = withDelay(
      1800,
      withTiming(1, { duration: 500 })
    );
    
    subtitleOpacity.value = withDelay(
      2200,
      withTiming(1, { duration: 500 })
    );
    
    // Background color transition
    backgroundColorAnim.value = withDelay(
      400,
      withTiming(1, { duration: 2000, easing: Easing.bezier(0.16, 1, 0.3, 1) })
    );
    
    // Show bottom sheet at the end
    loginSheetVisible.value = withDelay(
      3000,
      withTiming(1, { duration: 600 })
    );
  }, []);

  // Helper function to create a repeating animation
  const createBubbleAnimation = (from: number, to: number, duration: number): number => {
    'worklet';
    return withRepeat(
      withSequence(
        withTiming(to, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(from, { duration, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // infinite repetitions
      false
    );
  };

  // Animated styles
  const birdStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: birdY.value },
      { scale: birdScale.value },
      { rotate: `${birdRotation.value}deg` }
    ],
    opacity: birdOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: interpolate(textOpacity.value, [0, 1], [20, 0]) }
    ],
  }));  

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [
      { translateY: interpolate(subtitleOpacity.value, [0, 1], [20, 0]) }
    ],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backgroundColorAnim.value,
      [0, 1],
      [Colors.PitchBlack, '#14142B']
    ), 
  }));
  
  const bubble1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: bubbleScale1.value },
      { translateY: createBubbleAnimation(-15, 15, 7000) }
    ],
    opacity: bubbleScale1.value * 0.6,
  }));
  
  const bubble2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: bubbleScale2.value },
      { translateY: createBubbleAnimation(15, -15, 9000) }
    ],
    opacity: bubbleScale2.value * 0.6,
  }));
  
  const loginSheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(loginSheetVisible.value, [0, 1], [300, 0]) }
    ],
    opacity: loginSheetVisible.value,
  }));

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <StatusBar style="light" />
      
      {/* Background elements */}
      <Animated.View style={[styles.bubble, styles.bubble1, bubble1Style]} />
      <Animated.View style={[styles.bubble, styles.bubble2, bubble2Style]} />
      
      {/* Main content */}
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.logoContainer, birdStyle]}>
          <BirdVector width={180} height={180} />
        </Animated.View>
        
        <Animated.Text style={[styles.title, titleStyle]}>
          Welcome to <Text style={{ color: Colors.mainBlue }}>CurA</Text>
        </Animated.Text>
        
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your path to health and wellness
        </Animated.Text>
      </View>
      
      {/* Login sheet */}
      <Animated.View style={[styles.loginSheetContainer, loginSheetStyle]}>
        <BottomLoginSheet />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PitchBlack,
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textAlign: 'center',
    maxWidth: '80%',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 400,
    backgroundColor: Colors.mainBlue + '18',
  },
  bubble1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -height * 0.2,
    left: -width * 0.5,
  },
  bubble2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -height * 0.1,
    right: -width * 0.3,
    backgroundColor: Colors.mainBlue + '10',
  },
  loginSheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default AnimatedIntro;
