import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Colors from "~/utils/Colors";
import { ActivityIndicator } from "react-native";
import HabitDetail from "~/components/HabitDetail";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { SafeAreaView } from "react-native-safe-area-context";
import IconCircle from "~/components/IconCircle";
import { Suspense } from "react";

// Loading component for Suspense fallback
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.mainBlue} />
    <Text style={styles.loadingText}>Loading habit details...</Text>
  </View>
);

// Header component extracted for better reusability
const DetailsHeader = ({ title, onBack }: { title: string, onBack: () => void }) => {
  // Split the title into words
  const titleWords = title.split(" ");
  const lastWord = titleWords.pop(); // Get the last word
  const otherWords = titleWords; // Remaining words

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={{ marginLeft: 16, paddingEnd: 10 }}
      >
        <IconCircle name="chevron-back-sharp" size={17} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        {titleWords.length === 0 ? (
          <Text style={styles.titleWhite}>{title}</Text>
        ) : (
          <>
            {otherWords.map((word, index) => (
              <Text key={index} style={styles.titleWhite}>
                {word}{index < otherWords.length - 1 ? " " : ""}
              </Text>
            ))}
            {lastWord && (
              <Text style={styles.titleBlue}>{lastWord}</Text>
            )}
          </>
        )}
      </View>
      <View style={{ width: 50 }} />
    </View>
  );
};

// Dynamic header that fetches and displays the habit name
const DynamicDetailsHeader = ({ id, onBack }: { id: Id<"habits">, onBack: () => void }) => {
  const habit = useQuery(api.habits.getHabit, { id });
  
  return (
    <DetailsHeader 
      title={habit?.name || "..."}
      onBack={onBack}
    />
  );
};

// Main component with Suspense
const HabitDetailContent = ({ id, onClose }: { id: Id<"habits">, onClose: () => void }) => {
  const habit = useQuery(api.habits.getHabit, { id });
  const entries = useQuery(api.habits.getHabitEntries, { habitId: id });
  
  if (!habit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.mainBlue} />
      </View>
    );
  }

  // Combine habit data with entries
  const habitWithEntries = {
    ...habit,
    entries: entries || [],
    streak: calculateStreak(entries || []),
    progress: calculateProgress(habit, entries || [])
  };

  return (
    <HabitDetail
      habit={habitWithEntries}
      onClose={onClose}
    />
  );
};

export default function DetailsHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  if (!id) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <DynamicDetailsHeader 
        id={id as Id<"habits">}
        onBack={() => router.back()}
      />
      
      <Suspense fallback={<LoadingIndicator />}>
        <HabitDetailContent 
          id={id as Id<"habits">} 
          onClose={() => router.back()} 
        />
      </Suspense>
    </SafeAreaView>
  );
}

// Helper Functions
const calculateProgress = (habit: any, entries: any[]) => {
  if (habit.type === "numeric") {
    const current = entries.reduce(
      (sum, entry) => sum + (entry.value as number),
      0
    );
    return { current, target: habit.target || 0 };
  }
  if (habit.type === "boolean") {
    const current = entries.filter((e) => e.value === true).length;
    return { current, target: entries.length };
  }
  return { current: 0, target: 0 };
};

const calculateStreak = (entries: any[]) => {
  let streak = 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const entry of sorted) {
    if (entry.value === true) streak++;
    else break;
  }
  return streak;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.PitchBlack,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWhite: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "400",
  },
  titleBlue: {
    color: Colors.mainBlue,
    fontSize: 20,
    fontWeight: "400",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PitchBlack,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "400",
    marginTop: 10,
  }
});