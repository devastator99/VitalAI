import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Colors from "~/utils/Colors";
import IconCircle from "~/components/IconCircle";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "~/convex/_generated/api";
import { Suspense } from "react";
import { SettingsScreen } from "~/components/HabitSettings";

// Loading component for Suspense fallback
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.mainBlue} />
    <Text style={styles.loadingText}>Loading settings...</Text>
  </View>
);

export default function Settings() {
  const router = useRouter();

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
          <Text style={styles.titleWhite}>App </Text>
          <Text style={styles.titleBlue}>Settings</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <Suspense fallback={<LoadingIndicator />}>
        <SettingsScreen onSave={() => {}} onClose={() => router.back()} />
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
    flexDirection: "row",
    alignItems: "center",
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
  },
});
