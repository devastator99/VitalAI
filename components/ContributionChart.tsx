import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';


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

//habit name and frequency in header in weekdays with right icons for edit delete and share 
//display  total , score percent ,in a card
//display description in a card , 
//display linechart of progress  aand a notes section with add note button


interface Entry {
  date: string;
  value: number | boolean | string;
  notes?: string;
}

const { width: screenWidth } = Dimensions.get("window");
const COLOR_PALETTE = [
  "#e6ac00",
  "#2eb8b8",
  "#1a8cff",
  "#d31912",
  "#6a4c93",
  "#2eb8b8",
  "#999900",
  "#cc6600",
];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const ICONS = [
  "cup",
  "pill",
  "arm-flex",
  "food-apple",
  "sleep",
  "yoga",
  "walk",
];

const mockHabits: Habit[] = [
  {
    _id: "1",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[0],
    icon: ICONS[0],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "2",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[1],
    icon: ICONS[1],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "3",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[2],
    icon: ICONS[2],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "4",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[3],
    icon: ICONS[3],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "5",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[4],
    icon: ICONS[4],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "6",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[5],
    icon: ICONS[5],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "7",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[6],
    icon: ICONS[2],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
  {
    _id: "8",
    name: "Water Intake",
    type: "numeric",
    target: 8,
    unit: "glasses",
    frequency: DAYS,
    color: COLOR_PALETTE[7],
    icon: ICONS[5],
    entries: [
      { date: "2024-03-01", value: 7, notes: "Forgot morning glass" },
      { date: "2024-03-02", value: 8 },
      { date: "2024-03-03", value: 6, notes: "Travel day" },
    ],
    streak: 2,
    progress: { current: 21, target: 24 },
  },
];


const ContributionChart = ({ habits }: { habits: Habit[] }) => {
    // Generate data for the last 12 weeks (84 days)
    const getPast12Weeks = () => {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 84; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates.reverse();
    };
  
    // Process habit entries into contribution data
    const processContributions = () => {
      const dates = getPast12Weeks();
      const contributionData: { [key: string]: number } = {};
  
      // Initialize all dates with 0 count
      dates.forEach(date => {
        contributionData[date] = 0;
      });
  
      // Count completions per date across all habits
      habits.forEach(habit => {
        habit.entries.forEach(entry => {
          if (contributionData.hasOwnProperty(entry.date)) {
            if (habit.type === 'boolean' && entry.value === true) {
              contributionData[entry.date]++;
            } else if (habit.type === 'numeric' && (entry.value as number) >= (habit.target || 0)) {
              contributionData[entry.date]++;
            }
          }
        });
      });
  
      return dates.map(date => ({
        date,
        count: contributionData[date],
      }));
    };
  
    const data = processContributions();
    const weeks = 12;
    const daysInWeek = 7;
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const getMonthLabel = (weekIndex: number) => {
      if (weekIndex % 4 !== 0) return null;
      const firstDay = new Date(data[weekIndex * daysInWeek].date);
      return monthLabels[firstDay.getMonth()];
    };
  
    const getColor = (count: number) => {
      if (count === 0) return '#ebedf0';
      if (count === 1) return '#9be9a8';
      if (count === 2) return '#40c463';
      if (count === 3) return '#30a14e';
      return '#216e39';
    };
  
    return (
      <View style={contributionStyles.container}>
        <View style={contributionStyles.monthLabels}>
          {Array.from({ length: weeks }).map((_, i) => {
            const label = getMonthLabel(i);
            return label ? (
              <Text key={i} style={contributionStyles.monthLabel}>
                {label}
              </Text>
            ) : null;
          })}
        </View>
        
        <FlatList
          data={Array.from({ length: weeks })}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={contributionStyles.weekColumn}>
              {data.slice(index * daysInWeek, (index + 1) * daysInWeek).map((day, i) => (
                <View
                  key={`${index}-${i}`}
                  style={[
                    contributionStyles.day,
                    { backgroundColor: getColor(day.count) },
                  ]}
                />
              ))}
            </View>
          )}
        />
        
        <View style={contributionStyles.legend}>
          <Text style={contributionStyles.legendText}>Less</Text>
          {[0, 1, 2, 3, 4].map((count) => (
            <View
              key={count}
              style={[
                contributionStyles.legendDay,
                { backgroundColor: getColor(count) },
              ]}
            />
          ))}
          <Text style={contributionStyles.legendText}>More</Text>
        </View>
      </View>
    );
  };
  
  const contributionStyles = StyleSheet.create({
    container: {
      margin: 16,
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 12,
    },
    monthLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 30,
      marginBottom: 5,
    },
    monthLabel: {
      fontSize: 10,
      color: '#666',
      width: 60,
    },
    weekColumn: {
      marginRight: 2,
    },
    day: {
      width: 10,
      height: 10,
      borderRadius: 2,
      margin: 1,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 15,
      gap: 4,
    },
    legendDay: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
    legendText: {
      fontSize: 10,
      color: '#666',
      marginHorizontal: 4,
    },
  });


export default ContributionChart;