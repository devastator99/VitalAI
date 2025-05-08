import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import { Habit } from "~/utils/Interfaces";
import AnimHeader from "./AnimHeader";
import ScreenTransitionView from "./ScreenTransitionView";
import { COLOR_PALETTE } from "./habit_components/habit_icons";
import { Provider } from "react-native-paper";
import {LinearGradient} from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';

interface HabitDetailProps {
  habit: Habit;
  onClose: () => void;
}

const HabitDetail: React.FC<HabitDetailProps> = ({ habit, onClose }) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

// Helper to get the days in the current month
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 1; i <= numDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

const daysInMonth = getDaysInMonth(new Date());

// Format a date to YYYY-MM-DD for matching with habit entries
const formatDate = (date: Date) => date.toISOString().split("T")[0];

const toggleDateSelection = (date: Date) => {
  setSelectedDates(prev => {
    const dateString = formatDate(date);
    const exists = prev.some(d => formatDate(d) === dateString);
    return exists 
      ? prev.filter(d => formatDate(d) !== dateString)
      : [...prev, date];
  });
};

// Get entries for all selected dates
const entriesForSelectedDates = habit.entries.filter(entry =>
  selectedDates.some(d => formatDate(d) === entry.date)
);

  return (
    <Provider>
      <ScreenTransitionView style={{ flex: 1 ,marginTop:10}}>
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
              {/* Summary Section */}
              <LinearGradient
                colors={[habit.color + 'dd', habit.color + '55']}
                style={[styles.summaryCard, {
                  borderColor: habit.color + '66',
                }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.summaryRow}>
                  {[
                    { label: 'Current', value: habit.progress.current },
                    { label: 'Target', value: habit.progress.target },
                    { label: 'Streak', value: `${habit.streak}d` },
                  ].map((item, index) => (
                    <View key={index} style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, { color: habit.color }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.summaryValue, { color: '#fff' }]}>
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>

              {/* Calendar Section */}
              <Text style={[styles.sectionTitle, { color: "#fff" }]}>
                Progress Calendar
              </Text>
              <View style={styles.calendarContainer}>
                <Calendar
                  current={new Date().toISOString()}
                  onDayPress={(day: any) => toggleDateSelection(new Date(day.dateString))}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: habit.color + 'cc',
                    dayTextColor: habit.color,
                    todayTextColor: '#00BFFF',
                    selectedDayBackgroundColor: habit.color + '99',
                    selectedDayTextColor: '#fff',
                    arrowColor: habit.color,
                  }}
                  markedDates={{
                    ...Object.fromEntries(
                      selectedDates.map(d => [
                        formatDate(d), 
                        { selected: true }
                      ])
                    ),
                    ...Object.fromEntries(
                      habit.entries
                        .filter(entry => {
                          if (habit.type === "boolean") return entry.value === true;
                          if (habit.type === "numeric") return (entry.value as number) >= (habit.target || 0);
                          return false;
                        })
                        .map(entry => [entry.date, { marked: true, dotColor: habit.color }])
                    )
                  }}
                  dayComponent={({ date , state, marking }: any) => {
                    const dayDate = new Date(date.dateString);
                    const isSelected = selectedDates.some(d => 
                      formatDate(d) === formatDate(dayDate)
                    );
                    
                    return (
                      <TouchableOpacity
                        onPress={() => toggleDateSelection(dayDate)}
                        style={styles.dayWrapper}
                      >
                        <LinearGradient
                          colors={
                            isSelected
                              ? [habit.color + 'ee', habit.color + '99']
                              : ['#ffffff08', '#ffffff02']
                          }
                          style={[
                            styles.dayContainer,
                            dayDate.toDateString() === new Date().toDateString() && styles.today,
                            isSelected && styles.selectedDay,
                          ]}
                        >
                          <Text style={[
                            styles.dayText,
                            { 
                              color: isSelected 
                                ? '#fff' 
                                : (dayDate.toDateString() === new Date().toDateString() ? '#00BFFF' : habit.color + 'cc')
                            }
                          ]}>
                            {dayDate.getDate()}
                          </Text>
                          {marking?.marked && (
                            <View style={[styles.completionDot, {
                              backgroundColor: isSelected ? '#fff' : habit.color
                            }]} />
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* Selected Dates Section */}
              <Text style={[styles.sectionTitle, { color: habit.color }]}>
                {selectedDates.length} Days Selected
              </Text>
              <LinearGradient
                colors={[habit.color + '33', habit.color + '11']}
                style={styles.capsuleCard}
              >
                {entriesForSelectedDates.length > 0 ? (
                  entriesForSelectedDates.map((entry, index) => (
                    <View key={entry.date} style={[styles.entryItem, index > 0 && styles.entrySeparator]}>
                      <Text style={styles.entryDate}>{entry.date}</Text>
                      <Text style={styles.descriptionText}>
                        {habit.type === "boolean" 
                          ? `Completed: ${entry.value ? 'Yes' : 'No'}`
                          : `Value: ${entry.value} ${habit.unit || ''}`}
                      </Text>
                      {entry.notes && (
                        <Text style={styles.entryNotes}>Notes: {entry.notes}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.descriptionText}>
                    {selectedDates.length > 0 
                      ? "No entries for selected dates" 
                      : "Select dates to view details"}
                  </Text>
                )}
              </LinearGradient>

              {/* Description Section */}
              <Text style={[styles.sectionTitle, { color: habit.color }]}>
                Habit Overview
              </Text>
              <LinearGradient
                colors={[habit.color + '33', habit.color + '11']}
                style={styles.capsuleCard}
              >
                <Text style={styles.descriptionText}>
                  Track your progress on {habit.name.toLowerCase()}. Maintain your streak by
                  completing daily targets.{" "}
                  {habit.type === "numeric" &&
                    `Aim for ${habit.target} ${habit.unit} per day.`}
                </Text>
              </LinearGradient>
            </ScrollView>
          </View>
      </ScreenTransitionView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 40,
    marginBottom: 24,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 16,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  calendarContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: 'relative',
  },
  today: {
    borderWidth: 2,
    borderColor: '#00BFFF',
  },
  selectedDay: {
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  dayText: {
    fontWeight: '600',
    fontSize: 16,
  },
  capsuleCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffffff15',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffffdd',
    letterSpacing: 0.3,
  },
  completionDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  entryItem: {
    paddingVertical: 12,
  },
  entrySeparator: {
    borderTopWidth: 1,
    borderColor: '#ffffff33',
    marginTop: 12,
    paddingTop: 12,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: '#ffffff99',
    marginTop: 8,
  },
});

export default HabitDetail;