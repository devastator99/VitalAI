import React from "react";
import { View, StyleSheet } from "react-native";
import { Animated, Easing } from "react-native";

const dotSize = 8;
const dotSpacing = 8;
const animationDuration = 700;

export default function TypingIndicator() {
  const animatedValues = React.useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  React.useEffect(() => {
    const animations = animatedValues.map((animatedValue, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: animationDuration,
            delay: i * 120,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((anim) => anim.start());
    return () => {
      animations.forEach((anim) => anim.stop && anim.stop());
    };
  }, [animatedValues]);

  return (
    <View style={styles.container}>
      {animatedValues.map((animatedValue, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.dot,
            { opacity: animatedValue, marginLeft: idx === 0 ? 0 : dotSpacing },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dot: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: "#9ecfff",
  },
});
