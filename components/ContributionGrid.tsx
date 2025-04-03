import { View, Text, StyleSheet } from 'react-native';
import IconCircle from './IconCircle';
import React, { useMemo } from 'react';
import { FlashList } from "@shopify/flash-list";
import type { Habit } from "~/utils/Interfaces";
import type { Entry } from "~/utils/Interfaces";
import type { HabitType } from "~/utils/Interfaces";

  

  const ContributionGrid = React.memo(({ habit }: { habit: Habit }) => {
    // Use mockHabits as an example habit
    // Assuming mockHabits is an array and we take the first one
  
    // Generate dates for the last 90 days
    const getDates = () => {
      const dates = [];
      const today = new Date();
      // Adjust to 76 days (approx 11 weeks) to fit 3 months
      for (let i = 76; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };
  
    // Memoize dates
    const dates = useMemo(() => getDates(), []);
  
    // Memoize completedDates
    const completedDates = useMemo(() => new Set(
      habit.entries
        .filter(entry => {
          if (habit.type === 'boolean') return entry.value === true;
          if (habit.type === 'numeric') return (entry.value as number) >= (habit.target || 0);
          return false;
        })
        .map(entry => entry.date)
    ), [habit.entries, habit.type, habit.target]);
  
    // Create completion data array
    const completionData = dates.map(date => completedDates.has(date));
  
    // Group dates into weeks
    const groupIntoWeeks = (data: boolean[]) => {
      const weeks = [];
      for (let i = 0; i < data.length; i += 7) {
        weeks.push(data.slice(i, i + 7));
      }
      return weeks;
    };
  
    const data = groupIntoWeeks(completionData);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const getMonthLabel = (weekIndex: number) => {
      const firstDay = new Date(getDates()[weekIndex * 7]);
      return monthLabels[firstDay.getMonth()];
    };
  
    const calculateDateFromGridPosition = (weekIndex: number, dayIndex: number) => {
      const position = weekIndex * 7 + dayIndex;
      return dates[position] ?? ''; // Use the precomputed dates array
    };
  
    return (
      <View style={contributionStyles.habitContainer}>
        <View style={contributionStyles.habitHeader}>
          <IconCircle name={habit.icon} size={20} />
          <Text style={contributionStyles.habitName}>{habit.name}</Text>
        </View>
        
        <View style={contributionStyles.gridContainer}>
          <View style={contributionStyles.monthLabels}>
            {data.map((_, i) => (
              i % 5 === 0 && (
                <Text key={i} style={contributionStyles.monthLabel}>
                  {getMonthLabel(i)}
                </Text>
              )
            ))}
          </View>
          
          <FlashList
            horizontal
            data={data}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            estimatedItemSize={90}
            renderItem={({ item: week, index }) => (
              <View style={contributionStyles.weekColumn}>
                {week.map((completed, dayIndex) => {
                  // Calculate completion based on habit type and entries
                  const currentDate = calculateDateFromGridPosition(index, dayIndex);
                  const entry = habit.entries.find(e => e.date === currentDate);

                  let isCompleted = false;
                  if (habit.type === "boolean") {
                    isCompleted = entry?.value === true;
                  } else if (habit.type === "numeric") {
                    isCompleted = entry ? (entry.value as number) >= (habit.target as number) : false;
                  }
                  
                  return (
                    <View
                      key={`${index}-${dayIndex}`}
                      style={[
                        contributionStyles.day,
                        {
                          backgroundColor: isCompleted ? habit.color : '#ebedf0',
                          opacity: isCompleted ? 0.8 : 0.3,
                          position: 'absolute',
                          left: 0,
                          top: dayIndex * 17
                        }
                      ]}
                    />
                  );
                })}
              </View>
            )}
          />
        </View>
      </View>
    );
  });
  
  const contributionStyles = StyleSheet.create({
    habitContainer: {
      backgroundColor: '#1D1F24',
      borderRadius: 12,
      paddingVertical: 5,
      paddingHorizontal: 16,
      marginVertical: 8,
    },
    habitHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8
    },
    habitName: {
      color: '#fff',
      fontSize: 16,
      marginLeft: 12,
      fontWeight: '500',
    },
    gridContainer: {
      flexDirection: 'row',
      marginBottom: 14,
      marginLeft:10
    },
    monthLabels: {
      justifyContent: 'center',
      gap:10,
      marginRight: 20,
      paddingTop: 25,
    },
    monthLabel: {
      color: '#676D75',
      fontSize: 10,
      height: 20,
      marginBottom: 8,
    },
    weekColumn: {
      marginTop: 15,
      marginRight: 4,
      marginLeft:4,
      position: 'relative',
      height: 119,
      width: 15
    },
    day: {
      width: 15,
      height: 15,
      borderRadius: 4,
      margin: 1,
    },
  });

export default ContributionGrid;