import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Colors from '~/utils/Colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withRepeat,
  Easing,
  interpolateColor,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

// Responsive dimensions
const { width } = Dimensions.get('window');
const GLASS_WIDTH = width * 0.25;
const GLASS_HEIGHT = GLASS_WIDTH * 1.8;
const STEP = 0.1;           // change per press
const ANIM_DURATION = 800;  // ms

// Performance config for animations
const TIMING_CONFIG = {
  duration: ANIM_DURATION,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true
};

const RIPPLE_CONFIG = {
  duration: 500,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function WaterGlass() {
  const [level, setLevel] = useState(0.3); // Start with some water
  const waterHeight = level * GLASS_HEIGHT;
  const [showDrink, setShowDrink] = useState(false);
  const shakeValue = useSharedValue(0);
  const waterColorValue = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const drinkOpacity = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);
  
  const statusText = () => {
    if (level < 0.2) return 'Dehydrated!';
    if (level < 0.5) return 'Drink more!';
    if (level < 0.8) return 'Getting better!';
    return 'Hydrated!';
  };

  const increase = () => {
    // Ripple effect when adding water - optimized with native driver
    rippleScale.value = 0;
    rippleScale.value = withSequence(
      withTiming(1, { 
        duration: 500, 
        easing: Easing.out(Easing.cubic),
        // Native driver is true for scale transform
      }),
      withTiming(0, { 
        duration: 100,
        easing: Easing.linear,
        // Native driver is true for scale transform
      })
    );
    
    // Update water level
    setLevel(l => {
      const newLevel = Math.min(l + STEP, 1);
      // Update water color based on level
      // Note: color interpolation can't use native driver, but that's okay
      waterColorValue.value = withTiming(newLevel, { 
        duration: 1000,
        easing: Easing.inOut(Easing.cubic)
      });
      return newLevel;
    });
  };

  const decrease = () => {
    // Shake effect when removing water - optimized with native driver
    shakeValue.value = withSequence(
      withTiming(-2, { 
        duration: 100,
        easing: Easing.out(Easing.cubic),
        // Native driver is true for translateX
      }),
      withRepeat(withTiming(2, { 
        duration: 100,
        easing: Easing.out(Easing.cubic),
        // Native driver is true for translateX
      }), 2, true),
      withTiming(0, { 
        duration: 100,
        easing: Easing.out(Easing.cubic),
        // Native driver is true for translateX
      })
    );
    
    // Show "Drink" animation
    setShowDrink(true);
    drinkOpacity.value = withSequence(
      withTiming(1, { 
        duration: 200,
        easing: Easing.inOut(Easing.cubic),
        // Native driver is true for opacity
      }),
      withTiming(0, { 
        duration: 600,
        easing: Easing.out(Easing.cubic),
        // Native driver is true for opacity
      })
    );
    
    setTimeout(() => setShowDrink(false), 800);
    
    // Update water level
    setLevel(l => {
      const newLevel = Math.max(l - STEP, 0);
      // Update water color based on level
      waterColorValue.value = withTiming(newLevel, { 
        duration: 1000,
        easing: Easing.inOut(Easing.cubic)
      });
      return newLevel;
    });
  };

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeValue.value }]
    };
  });

  const waterStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      waterColorValue.value,
      [0, 0.5, 1],
      ['#4fc3f7', '#2196f3', '#1565c0'] // Light blue to deep blue
    );
    
    return {
      backgroundColor: color,
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: 1 - rippleScale.value,
    };
  });

  const drinkAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: drinkOpacity.value,
      transform: [
        { translateY: -20 * drinkOpacity.value }
      ]
    };
  });

  // Auto update color on mount
  useEffect(() => {
    waterColorValue.value = withTiming(level, { 
      duration: 1000,
      easing: Easing.inOut(Easing.cubic)
    });
  }, []);

  // Percentage text
  const percentText = Math.round(level * 100) + '%';

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{statusText()}</Text>
      
    <View style={styles.row}>
        <Pressable 
          onPress={decrease} 
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']}
            style={styles.button}
          >
            <Ionicons name="remove" size={24} color="#fff" />
          </LinearGradient>
      </Pressable>

        <View style={styles.glassContainer}>
          {/* Glass container with 3D perspective */}
          <Animated.View style={[styles.glassOuter, shakeStyle]}>
            {/* Main glass body with shadow */}
            <View style={styles.glassShadow}>
              {/* Inner glass container with 3D perspective and borders */}
      <View style={[styles.glass, { width: GLASS_WIDTH, height: GLASS_HEIGHT }]}>
                {/* Glass rim thickness at top */}
                <View style={styles.glassRim} />
                
                {/* Inner glass shadows for depth */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.08)', 'transparent']}
                  style={styles.innerShadowVertical}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                />
                
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(0,0,0,0.05)']}
                  style={styles.innerShadowHorizontal}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                />
                
                {/* Glass front face reflections */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.0)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.frontReflection}
                />
                
                {/* Edge highlight on left */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.leftEdgeHighlight}
                />
                
                {/* Edge highlight on right */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.rightEdgeHighlight}
                />
                
                {/* Animated water fill - optimized with native driver where possible */}
        <MotiView
          from={{ height: 0 }}
          animate={{ height: waterHeight }}
                  transition={{ 
                    type: 'timing', 
                    duration: ANIM_DURATION,
                    easing: Easing.out(Easing.cubic)
                  }}
                  style={[styles.water]}
                >
                  <Animated.View style={[styles.waterContent, waterStyle]}>
                    {/* Ripple effect when adding water */}
                    <Animated.View style={[styles.ripple, rippleStyle]} />
                    
                    {/* Water surface highlights */}
                    <LinearGradient
                      colors={['rgba(255,255,255,0.6)', 'transparent']}
                      style={styles.waterHighlight}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 0.4 }}
                    />
                    
                    {/* Water waves */}
                    <View style={styles.waterWave1} />
                    <View style={styles.waterWave2} />
                  </Animated.View>
                </MotiView>
                
                {/* Reflections on the glass that move with the water */}
                <View style={[
                  styles.waterLevelReflection, 
                  { height: GLASS_HEIGHT - waterHeight }
                ]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'transparent']}
                    start={{x: 0, y: 1}}
                    end={{x: 0, y: 0}}
                    style={styles.waterLevelGradient}
        />
      </View>

                {/* Water level percentage */}
                <View style={styles.percentContainer}>
                  <BlurView intensity={40} tint="dark" style={styles.percentBlur}>
                    <Text style={styles.percentText}>{percentText}</Text>
                  </BlurView>
                </View>
              </View>
              
              {/* Bottom shadow */}
              <View style={styles.bottomShadow} />
            </View>
            
            {/* Glass rim highlight */}
            <View style={styles.rimHighlight} />
            
            {/* "Drink" text animation - optimized with Reanimated layout animations */}
            {showDrink && (
              <Animated.View 
                style={[styles.drinkContainer, drinkAnimStyle]}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(600)}
              >
                <Text style={styles.drinkText}>💧 Gulp!</Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>

        <Pressable 
          onPress={increase} 
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']}
            style={styles.button}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
      </Pressable>
      </View>
      
      <View style={styles.levelInfo}>
        <View style={[styles.levelIndicator, { width: `${level * 100}%` }]}>
          <LinearGradient
            colors={['#4fc3f7', '#2196f3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.levelGradient}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  statusText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  glassContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  glassOuter: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'visible',
  },
  glassShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    borderRadius: 16,
  },
  glass: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  glassRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 3,
  },
  rimHighlight: {
    position: 'absolute',
    top: -1,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 1,
    zIndex: 10,
  },
  innerShadowVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    zIndex: 2,
  },
  innerShadowHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 2,
  },
  frontReflection: {
    position: 'absolute',
    top: 5, 
    left: 0,
    width: '50%',
    height: '60%', 
    borderTopLeftRadius: 16,
    zIndex: 3,
  },
  leftEdgeHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    left: 0,
    zIndex: 4,
  },
  rightEdgeHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    right: 0,
    zIndex: 4,
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -5,
    left: '10%',
    width: '80%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 50,
    transform: [{ scaleX: 0.9 }],
    zIndex: -1,
  },
  water: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  waterContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4DA6FF',
    position: 'relative',
  },
  waterHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    zIndex: 2,
  },
  waterWave1: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 50,
  },
  waterWave2: {
    position: 'absolute',
    top: 8,
    left: 5,
    right: 5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
  },
  waterLevelReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  waterLevelGradient: {
    flex: 1,
  },
  ripple: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  buttonContainer: {
    marginHorizontal: 15,
  },
  button: {
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  drinkContainer: {
    position: 'absolute',
    top: GLASS_HEIGHT * 0.3,
    right: -40,
    padding: 5,
    borderRadius: 15,
  },
  drinkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  percentContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 15,
    zIndex: 10,
  },
  percentBlur: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  percentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelInfo: {
    width: '90%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginTop: 15,
    overflow: 'hidden',
  },
  levelIndicator: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelGradient: {
    flex: 1,
  },
});
