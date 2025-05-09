import { useRouter } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Colors from "~/utils/Colors";
import IconCircle from "~/components/IconCircle";
import { SafeAreaView } from "react-native-safe-area-context";
import { HabitCreationScreen } from "~/components/HabitCreationScreen";
import { Habit } from "~/utils/Interfaces";
import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";
import { Suspense } from "react";

// Loading component for Suspense fallback
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.mainBlue} />
    <Text style={styles.loadingText}>Creating your new habit...</Text>
  </View>
);

export default function CreateHabit() {
  const router = useRouter();
  const createHabit = useMutation(api.habits.createHabit);

  const handleCreateHabit = async (
    newHabit: Omit<Habit, "_id" | "entries" | "streak" | "progress">
  ) => {
    const habitToCreate = {
      ...newHabit,
      streak: 0,
      progress: { current: 0 }
    };
    await createHabit(habitToCreate);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 16, paddingEnd: 10 }}
        >
          <IconCircle name="chevron-back-sharp" size={17} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleWhite}>Create </Text>
          <Text style={styles.titleBlue}>Habit</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <Suspense fallback={<LoadingIndicator />}>
        <HabitCreationScreen
          onCreate={handleCreateHabit}
          onClose={() => router.back()}
        />
      </Suspense>
    </SafeAreaView>
  );
}

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
    marginTop: 16,
    fontSize: 16,
  }
});
