import { View, Text, StyleSheet } from 'react-native';
import IconCircle from './IconCircle';
import React, { useMemo } from 'react';
import { FlashList } from "@shopify/flash-list";

type HabitType = "boolean" | "numeric" | "categorical";

interface Habit {
  _id: string;
  name: string;
  type: HabitType;
  target?: number;
  unit?: string;
  frequency: string[];
  color: string;
  icon: string;
  entries: Entry[];
  streak: number;
  progress: { current: number; target: number };
}

interface Entry {
    date: string;
    value: number | boolean | string;
    notes?: string;
  }
  

  const ContributionGrid = React.memo(({ habit }: { habit: Habit }) => {
    // Generate dates for the last 90 days
    const getDates = () => {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates.reverse();
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
  
    return (
      <View style={contributionStyles.habitContainer}>
        <View style={contributionStyles.habitHeader}>
          <IconCircle name={habit.icon} size={20} />
          <Text style={contributionStyles.habitName}>{habit.name}</Text>
        </View>
        
        <View style={contributionStyles.gridContainer}>
          <View style={contributionStyles.monthLabels}>
            {data.map((_, i) => (
              i % 4 === 0 && (
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
            estimatedItemSize={14}
            renderItem={({ item: week, index }) => (
              <View style={contributionStyles.weekColumn}>
                {week.map((completed, dayIndex) => (
                  <View
                    key={`${index}-${dayIndex}`}
                    style={[
                      contributionStyles.day,
                      {
                        backgroundColor: completed ? habit.color : '#ebedf0',
                        opacity: completed ? 0.8 : 0.3
                      }
                    ]}
                  />
                ))}
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
      marginBottom: 12,
    },
    habitName: {
      color: '#fff',
      fontSize: 16,
      marginLeft: 12,
      fontWeight: '500',
    },
    gridContainer: {
      flexDirection: 'row',
    },
    monthLabels: {
      justifyContent: 'center',
      gap:10,
      marginRight: 20,
      paddingTop: 0,
    },
    monthLabel: {
      color: '#676D75',
      fontSize: 10,
      height: 20,
      marginBottom: 8,
    },
    weekColumn: {
      marginTop:15,
      marginRight: 5,
    },
    day: {
      width: 15,
      height: 15,
      borderRadius: 4,
      margin: 1,
    },
  });

export default ContributionGrid;