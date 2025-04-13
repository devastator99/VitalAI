import React, { useRef, useCallback } from 'react';
import { Animated, TouchableOpacity, Text, ViewStyle } from 'react-native';
import Colors from '~/utils/Colors';

interface AnimatedButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  liquidColor: string;
  contentContainerStyle?: ViewStyle;
}

const AnimatedButton = React.memo(({ children, style, onPress, liquidColor, contentContainerStyle }: AnimatedButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const liquidWidth = useRef(new Animated.Value(0)).current;
  const textColor = useRef(new Animated.Value(0)).current;

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.96,
        speed: 50,
        useNativeDriver: true,
      }),
      Animated.timing(liquidWidth, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(textColor, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  }, [scaleValue, liquidWidth, textColor]);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(liquidWidth, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(textColor, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  }, [scaleValue, liquidWidth, textColor]);

  return (
    <TouchableOpacity 
      onPressIn={onPressIn} 
      onPressOut={onPressOut} 
      onPress={onPress}
      style={style}
      activeOpacity={1}
    >
      <Animated.View style={{ 
        transform: [{ scale: scaleValue }],
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        {/* Liquid background layer */}
        <Animated.View
          style={{
            position: 'absolute',
            height: '100%',
            width: liquidWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }),
            backgroundColor: liquidColor,
            opacity: liquidWidth.interpolate({
              inputRange: [0, 100],
              outputRange: [0.2, 1]
            }),
            borderRadius: 25,
          }}
        />
        
        {/* Content container with customizable style */}
        <Animated.View style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            minHeight: '100%',
            minWidth: '100%',
          },
          contentContainerStyle
        ]}>
          <Animated.Text style={{
            color: textColor.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.lightRed, '#fff']
            }),
            fontWeight: '500',
            zIndex: 1,
          }}>
            {children}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default AnimatedButton;
