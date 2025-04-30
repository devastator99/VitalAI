import React, { useCallback, memo, useMemo } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { History, Sun, Calendar } from 'lucide-react-native';


// Responsive sizing based on screen width
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PILL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);
const PILL_HEIGHT = Math.min(56, SCREEN_WIDTH * 0.11);
const PILL_PADDING = 5;
const BUTTON_HEIGHT = PILL_HEIGHT - PILL_PADDING * 2;
const BUTTON_WIDTH = (PILL_WIDTH - PILL_PADDING * 2) / 3;

interface WeekdaySelectorProps {
  selectedDate: string; // YYYY-MM-DD format
  onSelectDate: (date: string) => void;
}

const DAYS = [
  { icon: History, color: '#8B5CF6', label: 'Yesterday', key: 'yesterday' },
  { icon: Sun, color: '#F59E0B', label: 'Today', key: 'today' },
  { icon: Calendar, color: '#10B981', label: 'Tomorrow', key: 'tomorrow' },
];

const DayButton = memo(({ day, index, isSelected, onPress }: { day: any, index: number, isSelected: boolean, onPress: () => void }) => {
  const Icon = day.icon;
  
  return (
    <Pressable
      key={day.key}
      onPress={onPress}
      style={styles.button}
      android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
    >
      <MotiView
        animate={{
          scale: isSelected ? 1.05 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 200,
        }}
      >
        <View style={styles.buttonContent}>
          <Icon
            size={Math.min(24, SCREEN_WIDTH * 0.04)}
            color={isSelected ? 'white' : day.color}
            strokeWidth={2.5}
          />
          <MotiText 
            style={[
              styles.label, 
              { 
                color: isSelected ? 'white' : day.color,
                fontSize: isSelected ? Math.min(14, SCREEN_WIDTH * 0.030) : Math.min(13, SCREEN_WIDTH * 0.033)
              }
            ]}
          >
            {day.label}
          </MotiText>
        </View>
      </MotiView>
    </Pressable>
  );
});

export function WeekdaySelector({ selectedDate, onSelectDate }: WeekdaySelectorProps) {
  // Generate dates and format them
  const { dateStrings, selectedIndex } = useMemo(() => {
    const now = new Date();
    const dates = {
      yesterday: new Date(now),
      today: new Date(now),
      tomorrow: new Date(now),
    };
    dates.yesterday.setDate(now.getDate() - 1);
    dates.tomorrow.setDate(now.getDate() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const strings = [
      formatDate(dates.yesterday),
      formatDate(dates.today),
      formatDate(dates.tomorrow),
    ];

    return {
      dateStrings: strings,
      selectedIndex: strings.indexOf(selectedDate)
    };
  }, [selectedDate]); // Regenerate when selectedDate changes

  const handlePress = useCallback((index: number) => {
    onSelectDate(dateStrings[index]);
  }, [onSelectDate, dateStrings]);

  return (
    <MotiView
      style={[styles.pill, { width: PILL_WIDTH }]}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <MotiView
        style={[styles.activeBackground, { width: BUTTON_WIDTH }]}
        animate={{
          translateX: selectedIndex * BUTTON_WIDTH,
        }}
        transition={{ 
          type: 'spring', 
          damping: 20, 
          stiffness: 300,
          mass: 0.8,
        }}
      />
      {DAYS.map((day, index) => (
        <DayButton
          key={day.key}
          day={day}
          index={index}
          isSelected={selectedIndex === index}
          onPress={() => handlePress(index)}
        />
      ))}
    </MotiView>
  );
}

// Keep the same styles as before
const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    width: '80%',
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
    width: BUTTON_WIDTH,
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
