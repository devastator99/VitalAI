import React, { useMemo, useCallback, memo } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PILL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);
const PILL_HEIGHT = Math.min(56, SCREEN_WIDTH * 0.11);
const PILL_PADDING = 5;
const BUTTON_HEIGHT = PILL_HEIGHT - PILL_PADDING * 2;

interface ButtonData {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: string;
  label: string;
}

interface SliderSelectorProps {
  buttons: ButtonData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const Button = memo(
  ({
    icon: Icon,
    color,
    label,
    isSelected,
    onPress,
  }: {
    icon: ButtonData['icon'];
    color: string;
    label: string;
    isSelected: boolean;
    onPress: () => void;
  }) => {
    return (
      <Pressable onPress={onPress} style={styles.button} android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}>
        <MotiView
          animate={{ scale: isSelected ? 1.05 : 1 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View style={styles.buttonContent}>
            <Icon
              size={Math.min(24, SCREEN_WIDTH * 0.04)}
              color={isSelected ? 'white' : color}
              strokeWidth={2.5}
            />
            <MotiText
              style={[
                styles.label,
                {
                  color: isSelected ? 'white' : color,
                  fontSize: isSelected ? Math.min(14, SCREEN_WIDTH * 0.030) : Math.min(13, SCREEN_WIDTH * 0.033),
                },
              ]}
            >
              {label}
            </MotiText>
          </View>
        </MotiView>
      </Pressable>
    );
  }
);

export function SliderSelector({ buttons, selectedIndex, onSelect }: SliderSelectorProps) {
  const buttonWidth = useMemo(() => (PILL_WIDTH - PILL_PADDING * 2) / buttons.length, [buttons.length]);

  const handlePress = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect]
  );

  return (
    <MotiView
      style={[styles.pill, { width: PILL_WIDTH }]}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <MotiView
        style={[styles.activeBackground, { width: buttonWidth }]}
        animate={{ translateX: selectedIndex * buttonWidth }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
          mass: 0.8,
        }}
      />
      {buttons.map((btn, index) => (
        <Button
          key={index}
          icon={btn.icon}
          color={btn.color}
          label={btn.label}
          isSelected={selectedIndex === index}
          onPress={() => handlePress(index)}
        />
      ))}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    alignSelf: 'center',
    borderRadius: Math.min(12, SCREEN_WIDTH * 0.03),
    backgroundColor: 'rgba(108, 106, 106, 0.1)',
    flexDirection: 'row',
    padding: PILL_PADDING,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  activeBackground: {
    height: BUTTON_HEIGHT,
    borderRadius: Math.min(12, SCREEN_WIDTH * 0.03),
    backgroundColor: '#333',
    position: 'absolute',
    left: PILL_PADDING,
    top: PILL_PADDING,
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PILL_PADDING * 2,
  },
  buttonContent: {
    alignItems: 'center',
    gap: 4,
    flexDirection: 'row',
  },
  label: {
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
});
