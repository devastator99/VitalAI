import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const MIN_SCALE = 1;
const MAX_SCALE = 5;

export default function PreviewScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [showControls, setShowControls] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(
    parseInt(params.index as string) || 0
  );
  
  const allAssets = params.allAssets 
    ? JSON.parse(params.allAssets as string)
    : [];
  
  const currentAsset = allAssets[currentIndex] || {
    uri: params.assetUri,
    mediaType: params.mediaType,
  };

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const resetAnimation = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const closePreview = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const navigateToAsset = (direction: 'next' | 'prev') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    let newIndex = currentIndex;
    if (direction === 'next' && currentIndex < allAssets.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    if (newIndex !== currentIndex) {
      resetAnimation();
      setCurrentIndex(newIndex);
    }
  };

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      const newScale = context.startScale * event.scale;
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    },
    onEnd: () => {
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (scale.value > 1) {
        translateX.value = context.startX + event.translationX;
        translateY.value = context.startY + event.translationY;
      }
    },
    onEnd: () => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const doubleTapHandler = useAnimatedGestureHandler({
    onEnd: () => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2);
      }
      runOnJS(toggleControls)();
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showControls ? 1 : 0, { duration: 300 }),
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" hidden />
      
      <LinearGradient colors={['#000', '#000']} style={styles.container}>
        <TapGestureHandler onHandlerStateChange={toggleControls}>
          <Animated.View style={styles.imageContainer}>
            <PanGestureHandler onGestureEvent={panHandler}>
              <Animated.View style={styles.gestureContainer}>
                <PinchGestureHandler onGestureEvent={pinchHandler}>
                  <Animated.View style={styles.gestureContainer}>
                    <TapGestureHandler
                      numberOfTaps={2}
                      onGestureEvent={doubleTapHandler}
                    >
                      <Animated.View style={styles.gestureContainer}>
                        <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                          <Image
                            source={{ uri: currentAsset.uri }}
                            style={styles.image}
                            contentFit="contain"
                            transition={200}
                          />
                        </Animated.View>
                      </Animated.View>
                    </TapGestureHandler>
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </TapGestureHandler>

        <Animated.View style={[styles.overlay, overlayStyle]}>
          <BlurView intensity={20} style={styles.topBar}>
            <SafeAreaView edges={['top']}>
              <View style={styles.topBarContent}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={closePreview}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.counter}>
                  <Text style={styles.counterText}>
                    {currentIndex + 1} of {allAssets.length}
                  </Text>
                </View>
                <View style={styles.controlButton} />
              </View>
            </SafeAreaView>
          </BlurView>

          {allAssets.length > 1 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={() => navigateToAsset('prev')}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={32} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentIndex === allAssets.length - 1 && styles.navButtonDisabled,
                ]}
                onPress={() => navigateToAsset('next')}
                disabled={currentIndex === allAssets.length - 1}
              >
                <ChevronRight size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
});